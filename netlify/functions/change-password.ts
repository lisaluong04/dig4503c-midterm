import type { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { users } from '../../db/schema';

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { username, currentPassword, newPassword } = JSON.parse(event.body || '{}');

    if (!username || !currentPassword || !newPassword) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const result = await db.select().from(users).where(eq(users.username, username));
    if (result.length === 0) {
        return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
    }

    const valid = await bcrypt.compare(currentPassword, result[0].passwordHash);
    if (!valid) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Current password is incorrect' }) };
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.username, username));

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
