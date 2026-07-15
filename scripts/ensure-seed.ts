import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const dbPath = path.join(process.cwd(), "data", "db.json");

function hasSeed() {
  if (!fs.existsSync(dbPath)) return false;
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    return Array.isArray(db.vehicles) && db.vehicles.length > 0 && Array.isArray(db.riskClassMap);
  } catch {
    return false;
  }
}

if (hasSeed()) {
  console.log("Using committed data/db.json for Netlify build.");
  process.exit(0);
}

console.log("data/db.json missing — running seed…");
const result = spawnSync("npx", ["tsx", "scripts/seed.ts"], {
  stdio: "inherit",
  shell: true,
});
process.exit(result.status ?? 1);
