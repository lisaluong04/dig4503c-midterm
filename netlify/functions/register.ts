import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
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

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        await db.insert(users).values({ username, passwordHash });
    } catch {
        return {
            statusCode: 409,
            body: JSON.stringify({ error: 'Username already taken' })
        };
    }

    return {
        statusCode: 201,
        body: JSON.stringify({ username })
    };
};
