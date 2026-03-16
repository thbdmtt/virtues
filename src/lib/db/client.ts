import { loadEnvConfig } from "@next/env";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

loadEnvConfig(process.cwd());

const databasePath = process.env.DB_PATH ?? "./local.db";
const sqlite = new Database(databasePath);

sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, {
  schema,
});

export const sqliteClient = sqlite;
