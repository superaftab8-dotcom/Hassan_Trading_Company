import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const appData = pgTable("app_data", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
