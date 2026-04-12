import { integer, pgTable, varchar, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull().default('')
});

export const users = pgTable('users', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 100 }).notNull().unique(),
    passwordHash: text().notNull(),
    screenName: varchar('screen_name', { length: 100 }),
    profilePicture: text('profile_picture')
});

export const userPosts = pgTable('user_posts', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 100 }).notNull(),
    picks: text().notNull(),
    comment: text().notNull().default(''),
    createdAt: timestamp('created_at').notNull().defaultNow()
});

export const likes = pgTable('likes', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    postId: integer('post_id').notNull().references(() => userPosts.id, { onDelete: 'cascade' }),
    username: varchar({ length: 100 }).notNull()
}, (table) => ({
    uniqueUserPost: unique().on(table.postId, table.username)
}));