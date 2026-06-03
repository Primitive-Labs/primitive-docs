#!/usr/bin/env node
// Single source of truth for code examples: the `examples/` corpus feeds both
// doc trees.
//
//   • Human docs (docs/, VitePress)  — transclude with native `<<<` + code-group
//     tabs at build time. Nothing to do here.
//   • Agent guides (guides/, served as static single-language markdown by
//     `primitive guides get`) — can't transclude at serve time, so the corpus
//     code is injected into marked regions of the committed guide. This script
//     does that injection, and `--check` verifies the guides are in sync (CI).
//
// Agent-guide marker syntax (the `lang` is the guide's served language):
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
import { join, relative, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES_DIR = join(ROOT, "examples");
const GUIDES_DIR = join(ROOT, "guides", "latest");

const CHECK = process.argv.includes("--check");

// Languages required for every example, and their file ext + markdown fence.
const LANGS = {
  ts: { ext: "ts", fence: "typescript" },
  swift: { ext: "swift", fence: "swift" },
};
const REQUIRED_LANGS = Object.keys(LANGS);
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

const wantExts = new Set(REQUIRED_LANGS.map((l) => LANGS[l].ext));
const corpus = new Map(); // id -> { lang -> {file, code} }
for (const file of walk(EXAMPLES_DIR).filter((f) => wantExts.has(extname(f).slice(1)))) {
  const ext = extname(file).slice(1);
  const lang = REQUIRED_LANGS.find((l) => LANGS[l].ext === ext);
  const id = join(relative(EXAMPLES_DIR, dirname(file)), basename(file, `.${ext}`));
  const code = extractRegion(file, REGION);
  if (code === null) {
    problems.push(`✘ ${relative(ROOT, file)}: missing/unbalanced '#region ${REGION}'`);
  }
  if (!corpus.has(id)) corpus.set(id, {});
  corpus.get(id)[lang] = { file, code };
}

for (const [id, byLang] of [...corpus].sort()) {
  const missing = REQUIRED_LANGS.filter((l) => !byLang[l]);
  if (missing.length) problems.push(`✘ ${id}: missing language(s): ${missing.join(", ")}`);
}

console.log(`Corpus: ${corpus.size} example(s) × [${REQUIRED_LANGS.join(", ")}]`);

// ── 2. Inject / verify agent-guide regions ──────────────────────────────────
const MARKER = /<!--\s*example:start\s+(\S+)\s+lang=(\w+)\s*-->\n[\s\S]*?<!--\s*example:end\s*-->/g;

function buildBlock(id, lang) {
  const entry = corpus.get(id);
  if (!entry || !entry[lang]) throw new Error(`unknown example '${id}' lang=${lang}`);
  const fence = LANGS[lang].fence;
  return `<!-- example:start ${id} lang=${lang} -->\n\`\`\`${fence}\n${entry[lang].code}\n\`\`\`\n<!-- example:end -->`;
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
