/**
 * POST /api/plus/verify-purchase
 * Called by the iOS app after a successful StoreKit 2 purchase or restore.
 * Accepts the signed JWS transaction from StoreKit 2 and upserts the
 * subscription record server-side.
 *
 * Body: { signedTransaction: string, appAccountToken: string }
 *
 * In production, verify the JWS signature against Apple's public key chain
 * before trusting the payload. The appAccountToken must match the session user.
 */
import type { Request, Response } from 'express';
import { getAuthSession } from '@/server/lib/auth-session.js';
import { upsertSubscription, getEntitlement } from '@/server/lib/plus-entitlement.js';

interface StoreKit2Transaction {
  originalTransactionId: string;
  productId: string;
  appAccountToken?: string;
  expiresDate?: number;
  revocationDate?: number;
  environment?: string;
  type?: string;
}

function decodeJWS<T>(jws: string): T | null {
  try {
    const parts = jws.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export default async function handler(req: Request, res: Response): Promise<void> {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  const { signedTransaction } = req.body as { signedTransaction?: string };
  if (!signedTransaction || typeof signedTransaction !== 'string') {
    res.status(400).json({ error: 'MISSING_TRANSACTION' });
    return;
  }

  try {
    const txn = decodeJWS<StoreKit2Transaction>(signedTransaction);
    if (!txn?.originalTransactionId || !txn?.productId) {
      res.status(400).json({ error: 'INVALID_TRANSACTION' });
      return;
    }

    // Security: if appAccountToken is present, it must match the session user
    if (txn.appAccountToken && txn.appAccountToken !== session.user.id) {
      res.status(403).json({ error: 'ACCOUNT_MISMATCH' });
      return;
    }

    // Only accept our known product ID
    if (txn.productId !== 'com.spellful.plus.monthly') {
      res.status(400).json({ error: 'UNKNOWN_PRODUCT', productId: txn.productId });
      return;
    }

    const environment = txn.environment ?? 'production';
    const expiresAt = txn.expiresDate ? new Date(txn.expiresDate) : null;
    const cancelledAt = txn.revocationDate ? new Date(txn.revocationDate) : null;
    const status = cancelledAt ? 'refunded' : 'active';

    await upsertSubscription({
      userId: session.user.id,
      appleOriginalTransactionId: txn.originalTransactionId,
      appleProductId: txn.productId,
      status,
      environment,
      expiresAt,
      gracePeriodUntil: null,
      cancelledAt,
      rawNotificationPayload: signedTransaction.slice(0, 4000),
    });

    const entitlement = await getEntitlement(session.user.id);
    res.json({
      ok: true,
      isPlus: entitlement.isPlus,
      status: entitlement.status,
      expiresAt: entitlement.expiresAt?.toISOString() ?? null,
      environment,
    });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR', message: String(e) });
  }
}
