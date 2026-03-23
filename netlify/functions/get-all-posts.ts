import type { Handler } from '@netlify/functions';
import { desc, eq, count } from 'drizzle-orm';
import { db } from '../../db/index';
import { userPosts, likes } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username } = event.queryStringParameters || {};

    const posts = await db.select().from(userPosts).orderBy(desc(userPosts.createdAt));

    const enriched = await Promise.all(posts.map(async (post) => {
        const [{ value: likeCount }] = await db
            .select({ value: count() })
            .from(likes)
            .where(eq(likes.postId, post.id));

        let userLiked = false;
        if (username) {
            const userLike = await db.select().from(likes)
                .where(eq(likes.postId, post.id));
            userLiked = userLike.some(l => l.username === username);
        }

        return {
            ...post,
            picks: JSON.parse(post.picks),
            likeCount: Number(likeCount),
            userLiked
        };
    }));

    return {
        statusCode: 200,
        body: JSON.stringify({ posts: enriched })
    };
};
