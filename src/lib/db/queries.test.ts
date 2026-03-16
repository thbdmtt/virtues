import Database from "better-sqlite3";
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
type ClientModule = typeof import("./client");

const originalDbPath = process.env.DB_PATH;
const tempDirectory = mkdtempSync(join(tmpdir(), "franklin-virtues-"));
const testDatabasePath = join(tempDirectory, "queries.test.db");
const targetDate = "2026-03-16";
const targetWeekStart = new Date(2026, 2, 16);
const virtueId = 1;

let queriesModule: QueriesModule | null = null;
let clientModule: ClientModule | null = null;

function createTestDatabase() {
  const sqlite = new Database(testDatabasePath);

  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE virtues (
      id integer PRIMARY KEY NOT NULL,
      name_fr text NOT NULL,
      name_en text NOT NULL,
      description text NOT NULL,
      week_number integer NOT NULL UNIQUE
    );

    CREATE TABLE entries (
      date text NOT NULL,
      virtue_id integer NOT NULL,
      has_mark integer NOT NULL DEFAULT 1,
      PRIMARY KEY(date, virtue_id),
      FOREIGN KEY (virtue_id) REFERENCES virtues(id) ON DELETE cascade
    );

    CREATE TABLE week_cycles (
      week_start text PRIMARY KEY NOT NULL,
      virtue_focus_id integer NOT NULL,
      FOREIGN KEY (virtue_focus_id) REFERENCES virtues(id) ON DELETE restrict
    );
  `);

  const insertVirtue = sqlite.prepare(`
    INSERT INTO virtues (id, name_fr, name_en, description, week_number)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (let index = 1; index <= 13; index += 1) {
    insertVirtue.run(
      index,
      `Virtue ${index}`,
      `Virtue ${index}`,
      `Description ${index}`,
      index,
    );
  }

  sqlite.close();
}

function getQueriesModule(): QueriesModule {
  if (!queriesModule) {
    throw new Error("Queries module not initialized.");
  }

  return queriesModule;
}

function getClientModule(): ClientModule {
  if (!clientModule) {
    throw new Error("Client module not initialized.");
  }

  return clientModule;
}

beforeAll(async () => {
  createTestDatabase();
  process.env.DB_PATH = testDatabasePath;
  vi.resetModules();

  clientModule = await import("./client");
  queriesModule = await import("./queries");
});

beforeEach(() => {
  getClientModule().sqliteClient.prepare("DELETE FROM entries").run();
});

afterAll(() => {
  if (clientModule) {
    clientModule.sqliteClient.close();
  }

  if (originalDbPath) {
    process.env.DB_PATH = originalDbPath;
  } else {
    delete process.env.DB_PATH;
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
