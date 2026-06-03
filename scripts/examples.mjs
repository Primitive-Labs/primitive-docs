#!/usr/bin/env node
// Single source of truth for code examples: the `examples/` corpus feeds both
// doc trees.
//
//   • Human docs (docs/, VitePress)  — transclude with native `<<<` + code-group
//     tabs at build time. Nothing to do here.
//   • Agent guides (guides/, served as static single-variant markdown by
//     `primitive guides get`) — can't transclude at serve time, so the corpus
//     code is injected into marked regions of the committed guide. This script
//     does that injection, and `--check` verifies the guides are in sync (CI).
//
// Corpus shape (see scripts/variants.mjs): every example id must exist for
// every base language (`<op>.ts`, `<op>.swift`); platform-override files
// (`<op>.ios.swift` → variant swift_ios) are optional and only valid for
// declared variants.
//
// Agent-guide marker syntax (the `lang` is a variant id from variants.mjs):
//
//     <!-- example:start documents/list-shared lang=ts -->
//     ```typescript
//     …injected from examples/documents/list-shared.ts (#region example)…
//     ```
//     <!-- example:end -->
//
// Usage:
//   node scripts/examples.mjs            # parity-check corpus + inject into guides (writes)
//   node scripts/examples.mjs --check    # verify only; non-zero on drift/missing (CI)

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { baseLanguages, parseExampleFile, variantById } from "./variants.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES_DIR = join(ROOT, "examples");
const GUIDES_DIR = join(ROOT, "guides", "latest");

const CHECK = process.argv.includes("--check");

const BASE_LANGUAGES = baseLanguages();
const REGION = "example";

const problems = [];

// ── 1. Corpus parity + region validity ─────────────────────────────────────
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    // `_harness/` holds the compile scaffolding (fixture schema, generated
    // models, build dirs) — it is not part of the example corpus.
    if (name === "_harness" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function extractRegion(file, region) {
  const lines = readFileSync(file, "utf-8").split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`//\\s*#region\\s+${region}\\b`).test(l));
  const end = lines.findIndex((l) => new RegExp(`//\\s*#endregion\\s+${region}\\b`).test(l));
  if (start === -1 || end === -1 || end <= start) return null;
  return lines.slice(start + 1, end).join("\n");
}

// id -> { base: Map<language, {file, code}>, overrides: Map<variantId, {file, code}> }
const corpus = new Map();
let overrideCount = 0;
for (const file of walk(EXAMPLES_DIR)) {
  let parsed;
  try {
    parsed = parseExampleFile(relative(EXAMPLES_DIR, file));
  } catch (err) {
    problems.push(`✘ ${err.message}`);
    continue;
  }
  if (!parsed) continue; // not a corpus file (e.g. README.md)
  const code = extractRegion(file, REGION);
  if (code === null) {
    problems.push(`✘ ${relative(ROOT, file)}: missing/unbalanced '#region ${REGION}'`);
  }
  if (!corpus.has(parsed.id)) corpus.set(parsed.id, { base: new Map(), overrides: new Map() });
  const entry = corpus.get(parsed.id);
  if (parsed.platform === null) entry.base.set(parsed.language, { file, code });
  else { entry.overrides.set(parsed.variant.id, { file, code }); overrideCount++; }
}

for (const [id, entry] of [...corpus].sort()) {
  const missing = BASE_LANGUAGES.filter((l) => !entry.base.has(l));
  if (missing.length) problems.push(`✘ ${id}: missing language(s): ${missing.join(", ")}`);
}

console.log(
  `Corpus: ${corpus.size} example(s) × [${BASE_LANGUAGES.join(", ")}]` +
    (overrideCount ? ` + ${overrideCount} platform override(s)` : ""),
);

// ── 2. Inject / verify agent-guide regions ──────────────────────────────────
// NOTE: no committed guide currently uses these markers (the rendered builds
// come from render-guides.mjs templates instead) — this mode is kept working
// but is a candidate for removal in a future cleanup.
const MARKER = /<!--\s*example:start\s+(\S+)\s+lang=(\w+)\s*-->\n[\s\S]*?<!--\s*example:end\s*-->/g;

function buildBlock(id, variantId) {
  const variant = variantById.get(variantId);
  const entry = corpus.get(id);
  const slot = variant && entry
    ? (variant.platform === null
        ? entry.base.get(variant.language)
        : entry.overrides.get(variant.id) ?? entry.base.get(variant.language))
    : undefined;
  if (!slot) throw new Error(`unknown example '${id}' lang=${variantId}`);
  return `<!-- example:start ${id} lang=${variantId} -->\n\`\`\`${variant.fence}\n${slot.code}\n\`\`\`\n<!-- example:end -->`;
}

const guideFiles = walk(GUIDES_DIR).filter((f) => f.endsWith(".md"));
let injected = 0;
for (const file of guideFiles) {
  const src = readFileSync(file, "utf-8");
  if (!src.includes("<!-- example:start")) continue;
  let count = 0;
  const next = src.replace(MARKER, (_m, id, lang) => {
    count++;
    return buildBlock(id, lang);
  });
  if (next !== src) {
    if (CHECK) {
      problems.push(`✘ ${relative(ROOT, file)}: ${count} example region(s) out of sync with the corpus (run \`pnpm sync:examples\`)`);
    } else {
      writeFileSync(file, next);
      injected += count;
      console.log(`  synced ${count} region(s) in ${relative(ROOT, file)}`);
    }
  }
}

// ── report ──────────────────────────────────────────────────────────────────
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(CHECK ? "\nCorpus + agent guides are in sync." : `\nDone${injected ? ` (injected ${injected} region(s))` : ""}.`);
