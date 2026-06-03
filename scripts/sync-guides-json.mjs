#!/usr/bin/env node
// Point guides.json at the per-language built guides. For every
// `guides/latest/<BASE>.template.md`, the matching guides.json entry gets:
//   "file":  "<BASE>.ts.md"                          (default / back-compat: current CLI reads .file)
//   "files": { "ts": "<BASE>.ts.md", "swift": "<BASE>.swift.md" }   (future per-language CLI)
//
//   node scripts/sync-guides-json.mjs           # update
//   node scripts/sync-guides-json.mjs --check    # verify entries are current (CI)

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GUIDES_DIR = join(ROOT, "guides", "latest");
const JSON_PATH = join(GUIDES_DIR, "guides.json");
const CHECK = process.argv.includes("--check");

const stripExt = (f) => basename(f).replace(/\.(template|ts|swift)?\.md$/, "").replace(/\.md$/, "");
const templated = new Set(
  readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".template.md")).map((f) => f.replace(/\.template\.md$/, "")),
);

const manifest = JSON.parse(readFileSync(JSON_PATH, "utf-8"));
const problems = [];
let changed = 0;

for (const g of manifest.guides) {
  const base = stripExt(g.file);
  if (!templated.has(base)) continue;
  const want = { ts: `${base}.ts.md`, swift: `${base}.swift.md` };
  const ok = g.file === want.ts && g.files && g.files.ts === want.ts && g.files.swift === want.swift;
  if (ok) continue;
  if (CHECK) {
    problems.push(`✘ ${g.topic}: guides.json entry not pointing at built ${base}.{ts,swift}.md`);
  } else {
    g.file = want.ts;
    g.files = want;
    changed++;
  }
}

if (problems.length) {
  console.error(`${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
if (!CHECK && changed) writeFileSync(JSON_PATH, JSON.stringify(manifest, null, 2) + "\n");
console.log(CHECK ? "guides.json is current." : `Updated ${changed} guides.json entr${changed === 1 ? "y" : "ies"}.`);
