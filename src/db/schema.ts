import { integer, pgTable, varchar, text } from 'drizzle-orm/pg-core'

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
