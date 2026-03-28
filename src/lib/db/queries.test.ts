import { createClient, type Client } from "@libsql/client";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

type QueriesModule = typeof import("./queries");

const originalDatabaseUrl = process.env.TURSO_DATABASE_URL;
const originalAuthToken = process.env.TURSO_AUTH_TOKEN;
const originalCycleOriginWeekStart =
  process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START;
const tempDirectory = mkdtempSync(join(tmpdir(), "franklin-virtues-"));
const testDatabasePath = join(tempDirectory, "queries.test.db");
const testDatabaseUrl = `file:${testDatabasePath}`;
const targetDate = "2026-03-16";
const targetWeekStart = new Date(2026, 2, 16);
const virtueId = 1;

let queriesModule: QueriesModule | null = null;
let testClient: Client | null = null;

function getQueriesModule(): QueriesModule {
  if (!queriesModule) {
    throw new Error("Queries module not initialized.");
  }

  return queriesModule;
}

function getTestClient(): Client {
  if (!testClient) {
    throw new Error("Test client not initialized.");
  }

  return testClient;
}

async function createTestDatabase() {
  testClient = createClient({ url: testDatabaseUrl, authToken: "test-token" });

  await getTestClient().batch(
    [
      `
        CREATE TABLE virtues (
          id integer PRIMARY KEY NOT NULL,
          name_fr text NOT NULL,
          name_en text NOT NULL,
          description text NOT NULL,
          maxim text NOT NULL DEFAULT '',
          reflection text NOT NULL DEFAULT '',
          week_number integer NOT NULL UNIQUE
        )
      `,
      `
        CREATE TABLE entries (
          date text NOT NULL,
          virtue_id integer NOT NULL,
          has_mark integer NOT NULL DEFAULT 1,
          PRIMARY KEY(date, virtue_id),
          FOREIGN KEY (virtue_id) REFERENCES virtues(id) ON DELETE cascade
        )
      `,
      `
        CREATE TABLE week_cycles (
          week_start text PRIMARY KEY NOT NULL,
          virtue_focus_id integer NOT NULL,
          FOREIGN KEY (virtue_focus_id) REFERENCES virtues(id) ON DELETE restrict
        )
      `,
    ],
    "write",
  );

  for (let index = 1; index <= 13; index += 1) {
      await getTestClient().execute({
      sql: `
        INSERT INTO virtues (
          id,
          name_fr,
          name_en,
          description,
          maxim,
          reflection,
          week_number
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        index,
        `Virtue ${index}`,
        `Virtue ${index}`,
        `Description ${index}`,
        `Maxim ${index}`,
        `Reflection ${index}`,
        index,
      ],
    });
  }
}

beforeAll(async () => {
  await createTestDatabase();
  process.env.TURSO_DATABASE_URL = testDatabaseUrl;
  process.env.TURSO_AUTH_TOKEN = "test-token";
  process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START = "2026-03-16";
  vi.resetModules();

  queriesModule = await import("./queries");
});

beforeEach(async () => {
  await getTestClient().execute("DELETE FROM entries");
});

afterAll(() => {
  if (testClient) {
    testClient.close();
  }

  if (originalDatabaseUrl) {
    process.env.TURSO_DATABASE_URL = originalDatabaseUrl;
  } else {
    delete process.env.TURSO_DATABASE_URL;
  }

  if (originalAuthToken) {
    process.env.TURSO_AUTH_TOKEN = originalAuthToken;
  } else {
    delete process.env.TURSO_AUTH_TOKEN;
  }

  if (originalCycleOriginWeekStart) {
    process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START = originalCycleOriginWeekStart;
  } else {
    delete process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START;
  }

  rmSync(tempDirectory, { recursive: true, force: true });
});

describe("toggleMark", () => {
  it("creates a marked entry on the first toggle", async () => {
    await getQueriesModule().toggleMark(targetDate, virtueId);

    await expect(
      getQueriesModule().getWeekEntries(targetWeekStart),
    ).resolves.toEqual([{ date: targetDate, virtueId, hasMark: true }]);
  });

  it("removes the entry on the second toggle", async () => {
    await getQueriesModule().toggleMark(targetDate, virtueId);
    await getQueriesModule().toggleMark(targetDate, virtueId);

    await expect(
      getQueriesModule().getWeekEntries(targetWeekStart),
    ).resolves.toEqual([]);
  });

  it("recreates the entry on the third toggle", async () => {
    await getQueriesModule().toggleMark(targetDate, virtueId);
    await getQueriesModule().toggleMark(targetDate, virtueId);
    await getQueriesModule().toggleMark(targetDate, virtueId);

    await expect(
      getQueriesModule().getWeekEntries(targetWeekStart),
    ).resolves.toEqual([{ date: targetDate, virtueId, hasMark: true }]);
  });
});

describe("getVirtueFocusForWeek", () => {
  it("follows the configured cycle origin instead of the ISO calendar week", async () => {
    await expect(
      getQueriesModule().getVirtueFocusForWeek(new Date(2026, 2, 23)),
    ).resolves.toMatchObject({
      id: 2,
      weekNumber: 2,
      nameFr: "Virtue 2",
    });
  });
});
