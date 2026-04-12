import type { Handler } from '@netlify/functions';
import { desc, eq, count } from 'drizzle-orm';
import { db } from '../../db/index';
import { userPosts, likes, users } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username } = event.queryStringParameters || {};

    const posts = await db.select().from(userPosts).orderBy(desc(userPosts.createdAt));

    // Fetch profile pictures for all unique post authors in one query
    const authorNames = [...new Set(posts.map(p => p.username))];
    const authorProfiles = authorNames.length > 0
        ? await db.select({ username: users.username, profilePicture: users.profilePicture })
              .from(users)
        : [];
    const profileMap = Object.fromEntries(
        authorProfiles.map(u => [u.username, u.profilePicture ?? null])
    );

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
            userLiked,
            profilePicture: profileMap[post.username] ?? null
        };
    }));

    return {
        statusCode: 200,
        body: JSON.stringify({ posts: enriched })
    };
};
