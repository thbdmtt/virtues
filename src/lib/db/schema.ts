import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const virtues = sqliteTable("virtues", {
  id: integer("id").primaryKey(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  description: text("description").notNull(),
  maxim: text("maxim").notNull().default(""),
  weekNumber: integer("week_number").notNull().unique(),
});

export const entries = sqliteTable(
  "entries",
  {
    date: text("date").notNull(),
    virtueId: integer("virtue_id")
      .notNull()
      .references(() => virtues.id, { onDelete: "cascade" }),
    hasMark: integer("has_mark", { mode: "boolean" }).notNull().default(true),
  },
  (table) => [
    primaryKey({
      columns: [table.date, table.virtueId],
    }),
  ],
);

export const weekCycles = sqliteTable("week_cycles", {
  weekStart: text("week_start").primaryKey(),
  virtueFocusId: integer("virtue_focus_id")
    .notNull()
    .references(() => virtues.id, { onDelete: "restrict" }),
});

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  endpoint: text("endpoint").notNull().unique(),
  keysP256dh: text("keys_p256dh").notNull(),
  keysAuth: text("keys_auth").notNull(),
  createdAt: text("created_at").notNull(),
});
