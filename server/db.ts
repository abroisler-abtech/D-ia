import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, mentorInteractions, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }

  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function recordMentorInteraction(input: {
  userId?: number;
  kind: "assist" | "practice";
  prompt: string;
  response: string;
  context: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(mentorInteractions).values({
    userId: input.userId ?? null,
    kind: input.kind,
    prompt: input.prompt,
    response: input.response,
    context: input.context,
  });
}

export async function listMentorInteractions(userId: number, limit: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: mentorInteractions.id,
      kind: mentorInteractions.kind,
      prompt: mentorInteractions.prompt,
      createdAt: mentorInteractions.createdAt,
    })
    .from(mentorInteractions)
    .where(eq(mentorInteractions.userId, userId))
    .orderBy(desc(mentorInteractions.createdAt))
    .limit(limit);
}

