import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const downloads = sqliteTable('downloads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  videoUrl: text('video_url').notNull(),
  videoTitle: text('video_title'),
  videoAuthor: text('video_author'),
  videoThumbnail: text('video_thumbnail'),
  fileName: text('file_name'),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  error: text('error'),
});

export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;