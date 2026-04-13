import type { Handler } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { users } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username, displayName, profilePicture } = JSON.parse(event.body || '{}');

    if (!username) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing username' })
        };
    }

    const updates: Record<string, string | null> = {};

    if (displayName !== undefined) {
        const trimmed = (displayName as string).trim();
        if (trimmed.length > 100) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Screen name too long (max 100 characters)' })
            };
        }
        updates.displayName = trimmed || null;
    }

    if (profilePicture !== undefined) {
        updates.profilePicture = profilePicture || null;
    }

    if (Object.keys(updates).length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Nothing to update' })
        };
    }

    await db.update(users).set(updates).where(eq(users.username, username));

    return {
        statusCode: 200,
        body: JSON.stringify({ ok: true })
    };
};
