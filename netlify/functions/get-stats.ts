import type { Handler } from '@netlify/functions';
import { db } from '../../db/index';
import { userPosts } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const posts = await db.select({ picks: userPosts.picks }).from(userPosts);

    const counts: Record<string, number> = {};
    for (const post of posts) {
        const picks: string[] = JSON.parse(post.picks);
        for (const pick of picks) {
            counts[pick] = (counts[pick] || 0) + 1;
        }
    }

    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

    return {
        statusCode: 200,
        body: JSON.stringify({ top3: sorted })
    };
};
