import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { users } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing username or password' })
        };
    }

    const result = await db.select().from(users).where(eq(users.username, username));

    if (result.length === 0) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Invalid username or password' })
        };
    }

    const valid = await bcrypt.compare(password, result[0].passwordHash);

    if (!valid) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Invalid username or password' })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ username: result[0].username })
    };
};
