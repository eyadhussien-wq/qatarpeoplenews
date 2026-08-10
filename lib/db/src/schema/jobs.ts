import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  description: text("description").notNull(),
  applicationUrl: text("application_url"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});
