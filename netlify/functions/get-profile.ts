import type { Handler } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { users } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username } = event.queryStringParameters || {};

    if (!username) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing username' })
        };
    }

    const result = await db
        .select({ screenName: users.screenName, profilePicture: users.profilePicture })
        .from(users)
        .where(eq(users.username, username));

    if (result.length === 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'User not found' })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            screenName: result[0].screenName ?? null,
            profilePicture: result[0].profilePicture ?? null
        })
    };
};
