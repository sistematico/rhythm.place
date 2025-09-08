import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const downloads = sqliteTable("downloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  videoUrl: text("video_url").notNull(),
  videoTitle: text("video_title"),
  videoAuthor: text("video_author"),
  videoThumbnail: text("video_thumbnail"),
  fileName: text("file_name"),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  error: text("error"),
});

export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;

export const songs = sqliteTable("songs", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  artist: text().notNull(),
  path: text().notNull().unique(),
  cover: text().default("/images/logotipo.svg"), // Nova coluna para URL da capa
  coverPath: text(), // Caminho local da capa salva
});

export const requests = sqliteTable("requests", {
  id: integer().primaryKey({ autoIncrement: true }),
  songId: integer().notNull(),
});

export const requestsRelations = relations(requests, ({ many }) => ({
  songs: many(songs),
}));

export const history = sqliteTable("history", {
  id: integer().primaryKey({ autoIncrement: true }),
  songId: integer().notNull(),
});

export const historyRelations = relations(history, ({ many }) => ({
  songs: many(songs),
}));
