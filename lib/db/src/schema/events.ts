import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  venue: text("venue"),
  location: text("location"),
  imageUrl: text("image_url"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  registrationUrl: text("registration_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
