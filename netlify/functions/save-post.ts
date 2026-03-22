import type { Handler } from '@netlify/functions';
import { eq, and } from 'drizzle-orm';
import { db } from '../../db/index';
import { userPosts } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { postId, username, picks, comment } = JSON.parse(event.body || '{}');

    if (!username || !picks) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    // Update existing post if postId provided and user owns it
    if (postId) {
        const existing = await db.select().from(userPosts)
            .where(and(eq(userPosts.id, postId), eq(userPosts.username, username)));

        if (existing.length === 0) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
        }

        await db.update(userPosts)
            .set({ picks: JSON.stringify(picks), comment: comment || '' })
            .where(eq(userPosts.id, postId));

        return { statusCode: 200, body: JSON.stringify({ postId }) };
    }

    // Create new post
    const result = await db.insert(userPosts)
        .values({ username, picks: JSON.stringify(picks), comment: comment || '' })
        .returning({ id: userPosts.id });

    return { statusCode: 201, body: JSON.stringify({ postId: result[0].id }) };
};
