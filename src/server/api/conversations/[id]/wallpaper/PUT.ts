/**
 * PUT /api/conversations/:id/wallpaper
 * Upserts the calling user's wallpaper preference for this conversation.
 * Body: { themeId?, customImageUrl?, dimAmount?, blurAmount? }
 * Each participant sets their own view independently.
 */
import type { Request, Response } from 'express';
import { getAuthSession } from '@/server/lib/auth-session.js';
import { db } from '@/server/db/client.js';
import { conversations } from '@/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';

const ALLOWED_THEMES = ['default', 'celestial', 'moonlit', 'botanical', 'amethyst', 'minimalist', 'starfield'];

export default async function handler(req: Request<{ id: string }>, res: Response) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' });
  const myId = session.user.id;

  const convId = parseInt(req.params.id);
  if (isNaN(convId)) return res.status(400).json({ error: 'Invalid id' });

  // Verify participant
  const [conv] = await db
    .select({ p1: conversations.participant1Id, p2: conversations.participant2Id })
    .from(conversations)
    .where(eq(conversations.id, convId))
    .limit(1);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (conv.p1 !== myId && conv.p2 !== myId) return res.status(403).json({ error: 'Forbidden' });

  const body = req.body as {
    themeId?: string;
    customImageUrl?: string | null;
    dimAmount?: number;
    blurAmount?: number;
  };

  const themeId = body.themeId ?? 'default';
  if (!ALLOWED_THEMES.includes(themeId) && themeId !== 'custom') {
    return res.status(400).json({ error: `themeId must be one of: ${ALLOWED_THEMES.join(', ')}, custom` });
  }

  const customImageUrl = body.customImageUrl ?? null;
  const dimAmount = Math.min(100, Math.max(0, Math.round(body.dimAmount ?? 40)));
  const blurAmount = Math.min(20, Math.max(0, Math.round(body.blurAmount ?? 0)));

  await db.execute(sql`
    INSERT INTO messenger_wallpapers (user_id, conversation_id, theme_id, custom_image_url, dim_amount, blur_amount)
    VALUES (${myId}, ${convId}, ${themeId}, ${customImageUrl}, ${dimAmount}, ${blurAmount})
    ON DUPLICATE KEY UPDATE
      theme_id = VALUES(theme_id),
      custom_image_url = VALUES(custom_image_url),
      dim_amount = VALUES(dim_amount),
      blur_amount = VALUES(blur_amount),
      updated_at = NOW()
  `);

  res.json({ ok: true, themeId, customImageUrl, dimAmount, blurAmount });
}
