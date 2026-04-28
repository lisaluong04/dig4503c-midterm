import type { Handler } from '@netlify/functions';
import { desc, eq } from 'drizzle-orm';
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
        ? await db.select({ username: users.username, profilePicture: users.profilePicture, displayName: users.displayName })
              .from(users)
        : [];
    const profileMap = Object.fromEntries(
        authorProfiles.map(u => [u.username, { profilePicture: u.profilePicture ?? null, displayName: u.displayName ?? null }])
    );

    const enriched = await Promise.all(posts.map(async (post) => {
        const postLikes = await db.select().from(likes).where(eq(likes.postId, post.id));
        const likeCount = postLikes.length;
        const userLiked = username ? postLikes.some(l => l.username === username) : false;
        const likers = postLikes.map(l => profileMap[l.username]?.displayName || l.username);

        return {
            ...post,
            picks: JSON.parse(post.picks),
            likeCount,
            userLiked,
            likers,
            profilePicture: profileMap[post.username]?.profilePicture ?? null,
            displayName: profileMap[post.username]?.displayName ?? null
        };
    }));

    return {
        statusCode: 200,
        body: JSON.stringify({ posts: enriched })
    };
};
