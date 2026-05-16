import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ASSET_DIR = path.resolve("assets/generated");
const REQUIRED_STATES = ["idle", "attack", "hurt-sad"];
const SPORTS = ["football", "basketball", "volleyball", "badminton", "tennis", "pickleball", "chess", "cycling", "jogging", "fishing", "swimming", "yoga", "karate", "aerobics"];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function hasPngAlpha(file) {
  try {
    const handle = await fs.open(file, "r");
    const buffer = Buffer.alloc(26);
    await handle.read(buffer, 0, 26, 0);
    await handle.close();
    const isPng = buffer.toString("ascii", 1, 4) === "PNG";
    const colorType = buffer[25];
    return isPng && (colorType === 4 || colorType === 6);
  } catch {
    return false;
  }
}

const results = [];
for (const sport of SPORTS) {
  for (const state of REQUIRED_STATES) {
    const file = path.join(ASSET_DIR, `student-${sport}-${state}.png`);
    const present = await exists(file);
    const alpha = present ? await hasPngAlpha(file) : false;
    results.push({ file, ok: present && alpha, present, alpha });
  }
}

const missing = results.filter((item) => !item.ok);
const report = {
  generatedAt: new Date().toISOString(),
  checked: results.length,
  missing: missing.filter((item) => !item.present).map((item) => path.relative(process.cwd(), item.file)),
  failedAlpha: missing.filter((item) => item.present && !item.alpha).map((item) => path.relative(process.cwd(), item.file)),
  pass: missing.length === 0,
};
await fs.mkdir("tmp", { recursive: true });
await fs.writeFile("tmp/asset-audit.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
