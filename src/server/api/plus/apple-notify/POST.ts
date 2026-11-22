/**
 * POST /api/plus/apple-notify
 * Apple App Store Server Notifications V2 webhook.
 *
 * Apple sends signed JWS payloads. In production, verify the signature using
 * Apple's public key chain before processing. For now the handler parses the
 * payload and upserts the subscription record.
 *
 * Apple docs: https://developer.apple.com/documentation/appstoreservernotifications
 *
 * IMPORTANT: This endpoint must be registered in App Store Connect under
 * App Information > App Store Server Notifications > Production URL.
 * Use the same URL for sandbox (Apple routes sandbox notifications to the
 * production URL when configured).
 */
import type { Request, Response } from 'express';
import { upsertSubscription } from '@/server/lib/plus-entitlement.js';
import { db } from '@/server/db/client.js';
import { user } from '@/server/db/schema.js';
import { eq } from 'drizzle-orm';

// ── JWS payload types (simplified) ────────────────────────────────────────────

interface AppleJWSPayload {
  notificationType: string;
  subtype?: string;
  data?: {
    environment?: string;
    signedTransactionInfo?: string;
    signedRenewalInfo?: string;
  };
}

interface AppleTransactionPayload {
  originalTransactionId: string;
  productId: string;
  appAccountToken?: string; // our userId if we set it at purchase time
  expiresDate?: number; // ms epoch
  revocationDate?: number;
  revocationReason?: number;
  environment?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function decodeJWSPayload<T>(jws: string): T | null {
  try {
    const parts = jws.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = Buffer.from(padded, 'base64url').toString('utf8');
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

function mapNotificationTypeToStatus(
  notificationType: string,
  subtype?: string,
): string {
  switch (notificationType) {
    case 'SUBSCRIBED':
    case 'DID_RENEW':
      return 'active';
    case 'DID_FAIL_TO_RENEW':
      return subtype === 'GRACE_PERIOD' ? 'grace_period' : 'expired';
    case 'EXPIRED':
      return 'expired';
    case 'REVOKE':
      return 'refunded';
    case 'REFUND':
      return 'refunded';
    case 'DID_CHANGE_RENEWAL_STATUS':
      return subtype === 'AUTO_RENEW_DISABLED' ? 'active' : 'active'; // still active until expiry
    case 'GRACE_PERIOD_EXPIRED':
      return 'expired';
    default:
      return 'active';
  }
}

// ── Handler ────────────────────────────────────────────────────────────────────

export default async function handler(req: Request, res: Response): Promise<void> {
  // Always respond 200 quickly to Apple — process async
  res.status(200).json({ ok: true });

  try {
    const body = req.body as { signedPayload?: string };
    if (!body?.signedPayload) return;

    // Decode outer notification (production: verify signature here)
    const notification = decodeJWSPayload<AppleJWSPayload>(body.signedPayload);
    if (!notification?.data?.signedTransactionInfo) return;

    const txn = decodeJWSPayload<AppleTransactionPayload>(notification.data.signedTransactionInfo);
    if (!txn?.originalTransactionId) return;

    const environment = notification.data.environment ?? txn.environment ?? 'production';
    const status = mapNotificationTypeToStatus(notification.notificationType, notification.subtype);
    const expiresAt = txn.expiresDate ? new Date(txn.expiresDate) : null;
    const cancelledAt = txn.revocationDate ? new Date(txn.revocationDate) : null;

    // Resolve userId from appAccountToken (UUID we set at purchase time)
    let userId: string | null = txn.appAccountToken ?? null;

    // Fallback: look up by originalTransactionId if we already have a record
    if (!userId) {
      const { plusSubscriptions } = await import('@/server/db/schema.js');
      const { eq: eqFn } = await import('drizzle-orm');
      const existing = await db
        .select({ userId: plusSubscriptions.userId })
        .from(plusSubscriptions)
        .where(eqFn(plusSubscriptions.appleOriginalTransactionId, txn.originalTransactionId))
        .limit(1);
      userId = existing[0]?.userId ?? null;
    }

    if (!userId) {
      console.warn(JSON.stringify({ event: 'plus.apple_notify.no_user', originalTransactionId: txn.originalTransactionId }));
      return;
    }

    // Verify userId exists in our user table
    const userRows = await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1);
    if (userRows.length === 0) {
      console.warn(JSON.stringify({ event: 'plus.apple_notify.user_not_found', userId }));
      return;
    }

    await upsertSubscription({
      userId,
      appleOriginalTransactionId: txn.originalTransactionId,
      appleProductId: txn.productId,
      status,
      environment,
      expiresAt,
      gracePeriodUntil: status === 'grace_period' ? expiresAt : null,
      cancelledAt,
      rawNotificationPayload: body.signedPayload.slice(0, 4000),
    });

    console.log(JSON.stringify({
      event: 'plus.apple_notify.processed',
      notificationType: notification.notificationType,
      subtype: notification.subtype,
      status,
      userId,
      environment,
    }));
  } catch (e) {
    console.error(JSON.stringify({ event: 'plus.apple_notify.error', msg: String(e).slice(0, 200) }));
  }
}
