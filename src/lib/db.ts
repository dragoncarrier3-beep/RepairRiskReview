import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { DbShape } from "./types";

export type { DbShape } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const TMP_PATH = path.join("/tmp", "rrr-db.json");
const BLOB_KEY = "db";

let memoryCache: DbShape | null = null;

function isNetlify() {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_DEV);
}

function emptyDb(): DbShape {
  return {
    vehicles: [],
    customers: [],
    assessments: [],
    assessmentRepairs: [],
    riskDrivers: [],
    leads: [],
    reports: [],
    riskClassMap: [],
    scoreAdjustments: [],
    climateZones: [],
    repairProfiles: [],
    vehicleRepairMaps: [],
    underwriterRules: [],
    adminUsers: [],
    appConfig: [],
  };
}

function readSeedFile(): DbShape {
  if (fs.existsSync(DB_PATH)) {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8")) as DbShape;
  }
  return emptyDb();
}

function readLocalWritable(): DbShape | null {
  const candidates = isNetlify() ? [TMP_PATH, DB_PATH] : [DB_PATH, TMP_PATH];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, "utf8")) as DbShape;
      }
    } catch {
      // continue
    }
  }
  return null;
}

function writeLocalWritable(db: DbShape) {
  const target = isNetlify() ? TMP_PATH : DB_PATH;
  try {
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, JSON.stringify(db));
  } catch {
    // Serverless FS can be read-only outside /tmp — memory cache still works for this instance
  }
}

async function readFromBlobs(): Promise<DbShape | null> {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "rrr-demo", consistency: "strong" });
    const data = await store.get(BLOB_KEY, { type: "json" });
    return (data as DbShape) || null;
  } catch {
    return null;
  }
}

async function writeToBlobs(db: DbShape) {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "rrr-demo", consistency: "strong" });
    await store.setJSON(BLOB_KEY, db);
  } catch {
    // Blobs unavailable in local/non-Netlify — ignore
  }
}

export async function readDb(): Promise<DbShape> {
  if (memoryCache) return memoryCache;

  if (isNetlify()) {
    const fromBlob = await readFromBlobs();
    if (fromBlob) {
      memoryCache = fromBlob;
      return fromBlob;
    }
  }

  const local = readLocalWritable();
  if (local) {
    memoryCache = local;
    return local;
  }

  const seed = readSeedFile();
  memoryCache = seed;

  if (isNetlify()) {
    await writeToBlobs(seed);
    writeLocalWritable(seed);
  } else if (!fs.existsSync(DB_PATH)) {
    writeLocalWritable(seed);
  }

  return seed;
}

export async function saveDb(db: DbShape): Promise<void> {
  memoryCache = db;
  writeLocalWritable(db);
  if (isNetlify()) {
    await writeToBlobs(db);
  }
}

/** Sync helpers for local tooling / seed scripts */
export function ensureDb(): DbShape {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const db = emptyDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8")) as DbShape;
}

export function uid() {
  return randomUUID();
}

export function getConfig(db: DbShape, key: string): string | null {
  return db.appConfig.find((c) => c.key === key)?.value ?? null;
}

export { DB_PATH };
