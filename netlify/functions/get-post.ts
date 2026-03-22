import type { Handler } from '@netlify/functions';
import { eq, and, count } from 'drizzle-orm';
import { db } from '../../db/index';
import { userPosts, likes } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { postId, username } = event.queryStringParameters || {};

    if (!postId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing postId' }) };
    }

    const id = parseInt(postId);
    const post = await db.select().from(userPosts).where(eq(userPosts.id, id));

    if (post.length === 0) {
        return { statusCode: 404, body: JSON.stringify({ error: 'Post not found' }) };
    }

    const [{ value: likeCount }] = await db
        .select({ value: count() })
        .from(likes)
        .where(eq(likes.postId, id));

    let userLiked = false;
    if (username) {
        const userLike = await db.select().from(likes)
            .where(and(eq(likes.postId, id), eq(likes.username, username)));
        userLiked = userLike.length > 0;
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            ...post[0],
            picks: JSON.parse(post[0].picks),
            likeCount: Number(likeCount),
            userLiked
        })
    };
};
