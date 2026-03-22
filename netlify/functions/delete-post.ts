import type { Handler } from '@netlify/functions';
import { eq, and } from 'drizzle-orm';
import { db } from '../../db/index';
import { userPosts } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { postId, username } = JSON.parse(event.body || '{}');

    if (!postId || !username) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const post = await db.select().from(userPosts)
        .where(and(eq(userPosts.id, postId), eq(userPosts.username, username)));

    if (post.length === 0) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    await db.delete(userPosts).where(eq(userPosts.id, postId));

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
