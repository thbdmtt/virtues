import { loadEnvConfig } from "@next/env";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";

import * as schema from "./schema";

loadEnvConfig(process.cwd());

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "local.db");
const sqlite = new Database(DB_PATH);

sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, {
  schema,
});

export const sqliteClient = sqlite;
