#!/usr/bin/env node
// Build the per-language agent guides: for every
// `guides/latest/<X>.template.md` (a language-neutral guide with
// `{{ example: subject/id }}` placeholders), render the two committed,
// CLI-fetchable builds `<X>.ts.md` and `<X>.swift.md` by filling each
// placeholder with that example's TypeScript / Swift region from the corpus.
//
// Both builds are committed so they're validated here and the CLI just fetches
// the one matching the project's language. Inline (non-placeholder) blocks copy
// through unchanged.
//
//   node scripts/render-guides.mjs           # write <X>.ts.md and <X>.swift.md
//   node scripts/render-guides.mjs --check    # verify committed builds are current (CI)

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GUIDES_DIR = join(ROOT, "guides", "latest");
const EXAMPLES_DIR = join(ROOT, "examples");
const CHECK = process.argv.includes("--check");

const EXT = { ts: "ts", swift: "swift" };
const FENCE = { ts: "typescript", swift: "swift" };

function regionFor(id, lang) {
  const file = join(EXAMPLES_DIR, `${id}.${EXT[lang]}`);
  const lines = readFileSync(file, "utf-8").split(/\r?\n/);
  const s = lines.findIndex((l) => /\/\/\s*#region\s+example\b/.test(l));
  const e = lines.findIndex((l) => /\/\/\s*#endregion\s+example\b/.test(l));
  if (s === -1 || e === -1 || e <= s) throw new Error(`region 'example' not found in ${file}`);
  return lines.slice(s + 1, e).join("\n");
}

function render(template, lang) {
  return template.replace(/\{\{\s*example:\s*([\w.-]+\/[\w.-]+)\s*\}\}/g, (_, id) => {
    return "```" + FENCE[lang] + "\n" + regionFor(id, lang) + "\n```";
  });
}

const templates = readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".template.md"));
const problems = [];
let written = 0;

for (const t of templates) {
  const base = t.replace(/\.template\.md$/, "");
  const src = readFileSync(join(GUIDES_DIR, t), "utf-8");
  // Catch stray placeholders that don't resolve, before writing.
  for (const m of src.matchAll(/\{\{\s*example:\s*([\w.-]+\/[\w.-]+)\s*\}\}/g)) {
    for (const lang of ["ts", "swift"]) {
      try { regionFor(m[1], lang); }
      catch { problems.push(`✘ ${t}: {{ example: ${m[1]} }} has no ${lang} corpus region`); }
    }
  }
  for (const lang of ["ts", "swift"]) {
    const out = join(GUIDES_DIR, `${base}.${lang}.md`);
    const rendered = render(src, lang);
    if (CHECK) {
      let current = "";
      try { current = readFileSync(out, "utf-8"); } catch { /* missing */ }
      if (current !== rendered) problems.push(`✘ ${base}.${lang}.md is stale — run \`pnpm render:guides\``);
    } else {
      writeFileSync(out, rendered);
      written++;
    }
  }
}

console.log(`Guide templates: ${templates.length} → ${templates.length * 2} per-language builds`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(CHECK ? "All per-language guide builds are current." : `Rendered ${written} build(s).`);
