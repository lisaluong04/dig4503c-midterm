import type { Handler } from '@netlify/functions';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index';
import { userPosts, likes } from '../../db/schema';
import { count, and } from 'drizzle-orm';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username } = event.queryStringParameters || {};

    if (!username) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing username' }) };
    }

    const post = await db.select().from(userPosts)
        .where(eq(userPosts.username, username))
        .orderBy(desc(userPosts.createdAt))
        .limit(1);

    if (post.length === 0) {
        return { statusCode: 200, body: JSON.stringify({ post: null }) };
    }

    const [{ value: likeCount }] = await db
        .select({ value: count() })
        .from(likes)
        .where(eq(likes.postId, post[0].id));

    return {
        statusCode: 200,
        body: JSON.stringify({
            post: {
                ...post[0],
                picks: JSON.parse(post[0].picks),
                likeCount: Number(likeCount)
            }
        })
    };
};
