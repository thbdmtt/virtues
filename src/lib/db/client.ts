import { loadEnvConfig } from "@next/env";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error("TURSO_DATABASE_URL manquant");
}

if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN manquant");
}

const client = createClient({
  url: databaseUrl,
  authToken,
});

export const db = drizzle(client, { schema });
