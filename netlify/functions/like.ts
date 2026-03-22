import type { Handler } from '@netlify/functions';
import { eq, and, count } from 'drizzle-orm';
import { db } from '../../db/index';
import { userPosts, likes } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { postId, username } = JSON.parse(event.body || '{}');

    if (!postId || !username) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const post = await db.select().from(userPosts).where(eq(userPosts.id, postId));

    if (post.length === 0) {
        return { statusCode: 404, body: JSON.stringify({ error: 'Post not found' }) };
    }

    if (post[0].username === username) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Cannot like your own post' }) };
    }

    const existing = await db.select().from(likes)
        .where(and(eq(likes.postId, postId), eq(likes.username, username)));

    if (existing.length > 0) {
        await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.username, username)));
    } else {
        await db.insert(likes).values({ postId, username });
    }

    const [{ value: likeCount }] = await db
        .select({ value: count() })
        .from(likes)
        .where(eq(likes.postId, postId));

    return {
        statusCode: 200,
        body: JSON.stringify({ liked: existing.length === 0, likeCount: Number(likeCount) })
    };
};
