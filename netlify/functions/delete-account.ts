import type { Handler } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { users, userPosts, likes } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username } = JSON.parse(event.body || '{}');

    if (!username) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing username' }) };
    }

    const user = await db.select().from(users).where(eq(users.username, username));
    if (user.length === 0) {
        return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
    }

    // Delete likes the user placed on other people's posts
    await db.delete(likes).where(eq(likes.username, username));

    // Delete user's posts (cascades to likes on those posts)
    await db.delete(userPosts).where(eq(userPosts.username, username));

    // Delete the user record
    await db.delete(users).where(eq(users.username, username));

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
