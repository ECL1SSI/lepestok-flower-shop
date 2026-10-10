import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', { id: text('id').primaryKey(), kind: text('kind').notNull(), data: text('data').notNull() });
export const users = sqliteTable('users', { id: text('id').primaryKey(), email: text('email').notNull().unique(), hash: text('hash').notNull(), salt: text('salt').notNull(), role: text('role').notNull(), data: text('data').notNull(), demo: integer('demo').notNull().default(0) });
export const sessions = sqliteTable('sessions', { token: text('token').primaryKey(), userId: text('user_id').notNull(), expires: integer('expires').notNull() });
export const attempts = sqliteTable('attempts', { key: text('key').primaryKey(), count: integer('count').notNull(), expires: integer('expires').notNull() });
