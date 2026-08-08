import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const newsCategories = pgTable("news_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const news = pgTable("news", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  videoUrl: text("video_url"),
  categoryId: uuid("category_id").references(() => newsCategories.id, { onDelete: "set null" }),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  isBreaking: boolean("is_breaking").notNull().default(false),
  views: integer("views").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("news_status_idx").on(table.status),
  publishedIdx: index("news_published_at_idx").on(table.publishedAt),
  categoryIdx: index("news_category_idx").on(table.categoryId),
}));

export const newsMedia = pgTable("news_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  newsId: uuid("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["image", "video"] }).notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
