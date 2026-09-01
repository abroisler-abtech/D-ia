import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** A compact history of prompts, tutor answers, and generated practice challenges. */
export const mentorInteractions = mysqlTable("mentorInteractions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  kind: mysqlEnum("kind", ["assist", "practice"]).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  context: text("context").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type MentorInteraction = typeof mentorInteractions.$inferSelect;

