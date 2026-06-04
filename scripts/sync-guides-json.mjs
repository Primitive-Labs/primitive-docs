#!/usr/bin/env node
// Point guides.json at the per-variant built guides, in the manifest shape the
// CLI consumes (js-bao-wss#977): language and platform are independent,
// optional dimensions — an omitted dimension means agnostic.
//
//   {
//     "defaults": { "language": "ts", "platform": "web" },
//     "guides": [
//       { "topic": "...",
//         "file": "<BASE>.ts.md",                       // default variant, always present
//         "variants": [
//           { "language": "ts",    "file": "<BASE>.ts.md" },
//           { "language": "swift", "file": "<BASE>.swift.md" }
//         ] }
//     ]
//   }
//
// For every `guides/latest/<BASE>.template.md`, the matching entry's `file`
// and `variants` are derived from scripts/variants.mjs. Non-templated guides
// (e.g. the hand-written Swift client guide) keep their hand-maintained
// `file`/`variants`.
//
//   node scripts/sync-guides-json.mjs           # update
//   node scripts/sync-guides-json.mjs --check    # verify entries are current (CI)

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { VARIANTS, DEFAULT_VARIANT_ID, MANIFEST_DEFAULTS, manifestVariant } from "./variants.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GUIDES_DIR = join(ROOT, "guides", "latest");
const JSON_PATH = join(GUIDES_DIR, "guides.json");
const CHECK = process.argv.includes("--check");

const variantIds = VARIANTS.map((v) => v.id);
const stripExt = (f) =>
  basename(f).replace(new RegExp(`\\.(template|${variantIds.join("|")})\\.md$`), "").replace(/\.md$/, "");
const templated = new Set(
  readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".template.md")).map((f) => f.replace(/\.template\.md$/, "")),
);

const manifest = JSON.parse(readFileSync(JSON_PATH, "utf-8"));
const problems = [];
let changed = 0;

if (JSON.stringify(manifest.defaults) !== JSON.stringify(MANIFEST_DEFAULTS)) {
  if (CHECK) {
    problems.push(`✘ guides.json "defaults" doesn't match variants.mjs MANIFEST_DEFAULTS`);
  } else {
    manifest.defaults = MANIFEST_DEFAULTS;
    changed++;
  }
}

for (const g of manifest.guides) {
  const base = stripExt(g.file);
  if (!templated.has(base)) continue;
  // Concept-only templates build to a single agnostic `<BASE>.md` (see
  // render-guides.mjs, which runs before this script) and list no variants —
  // the CLI then serves the default `file` for every language/platform request.
  const agnostic = existsSync(join(GUIDES_DIR, `${base}.md`));
  const wantFile = agnostic ? `${base}.md` : `${base}.${DEFAULT_VARIANT_ID}.md`;
  const wantVariants = agnostic ? undefined : VARIANTS.map((v) => manifestVariant(v, base));
  const variantsOk = agnostic
    ? !("variants" in g)
    : JSON.stringify(g.variants) === JSON.stringify(wantVariants);
  const ok = g.file === wantFile && !("files" in g) && variantsOk;
  if (ok) continue;
  if (CHECK) {
    problems.push(
      agnostic
        ? `✘ ${g.topic}: guides.json entry should point at the agnostic ${base}.md with no variants`
        : `✘ ${g.topic}: guides.json entry not pointing at built ${base}.{${variantIds.join(",")}}.md variants`,
    );
  } else {
    g.file = wantFile;
    if (agnostic) delete g.variants;
    else g.variants = wantVariants;
    delete g.files;
    changed++;
  }
}

// relatedGuides/prerequisites are hand-maintained topic references — verify
// each names a topic that exists in this manifest. A guide removal/rename
// otherwise leaves dangling references that the CLI surfaces to agents, who
// then run `guides get <topic>` and hit "Guide not found".
const topics = new Set(manifest.guides.map((g) => g.topic));
for (const g of manifest.guides) {
  for (const key of ["relatedGuides", "prerequisites"]) {
    for (const ref of g[key] ?? []) {
      if (!topics.has(ref)) {
        problems.push(`✘ ${g.topic}: ${key} references unknown topic "${ref}"`);
      }
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
if (!CHECK && changed) {
  // `defaults` first, then `guides` — the manifest's documented key order.
  const out = { defaults: manifest.defaults, ...manifest };
  writeFileSync(JSON_PATH, JSON.stringify(out, null, 2) + "\n");
}
console.log(CHECK ? "guides.json is current." : `Updated ${changed} guides.json entr${changed === 1 ? "y" : "ies"}.`);
