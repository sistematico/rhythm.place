import { integer, pgTable, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique()
})

export const songs = pgTable('songs', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  filePath: text().unique().notNull(),
  title: text(),
  artist: text(),
  album: text(),
  duration: integer(),
  bitrate: integer()
})

export const requests = pgTable('requests', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  songId: integer().references(() => songs.id).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  dispatched: boolean().default(false).notNull(),
  dispatchedAt: timestamp()
})