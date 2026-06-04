#!/usr/bin/env node
// Build the per-variant agent guides: for every
// `guides/latest/<X>.template.md` (a variant-neutral guide with
// `{{ example: subject/id }}` placeholders), render one committed,
// CLI-fetchable build `<X>.<variantId>.md` per variant declared in
// scripts/variants.mjs, filling each placeholder with that example's corpus
// region for the variant (platform override first, base-language fallback).
//
// All builds are committed so they're validated here and the CLI just fetches
// the one matching the project's language/platform. Inline (non-placeholder)
// blocks copy through unchanged.
//
//   node scripts/render-guides.mjs           # write every <X>.<variantId>.md
//   node scripts/render-guides.mjs --check    # verify committed builds are current (CI)

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { VARIANTS, exampleCandidates } from "./variants.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GUIDES_DIR = join(ROOT, "guides", "latest");
const EXAMPLES_DIR = join(ROOT, "examples");
const CHECK = process.argv.includes("--check");

function regionFor(id, variant) {
  const candidates = exampleCandidates(variant, id).map((p) => join(EXAMPLES_DIR, p));
  const file = candidates.find((p) => existsSync(p)) ?? candidates[candidates.length - 1];
  const lines = readFileSync(file, "utf-8").split(/\r?\n/);
  const s = lines.findIndex((l) => /\/\/\s*#region\s+example\b/.test(l));
  const e = lines.findIndex((l) => /\/\/\s*#endregion\s+example\b/.test(l));
  if (s === -1 || e === -1 || e <= s) throw new Error(`region 'example' not found in ${file}`);
  return lines.slice(s + 1, e).join("\n");
}

// Language-scoped blocks: content between `{{#lang ts}}` / `{{/lang}}` (or
// `{{#lang swift}}`) renders ONLY into builds of that language. This is how a
// template carries language-specific notes and gotchas without shipping them
// to the other language's build — an iOS agent fetching the swift guide should
// never receive JavaScript gotchas. Blocks may span multiple lines; they do
// not nest. The marker lines themselves are removed from the output, and a
// dropped block collapses (no blank-line residue).
function applyLangBlocks(template, variant, problems, templateName) {
  const open = /\{\{#lang\s+([\w-]+)\s*\}\}/g;
  // Validate balance + known languages once per template (caller dedupes).
  const langs = new Set(VARIANTS.map((v) => v.language));
  for (const m of template.matchAll(open)) {
    if (!langs.has(m[1]) && problems) {
      problems.push(`✘ ${templateName}: {{#lang ${m[1]}}} is not a declared language (${[...langs].join(", ")})`);
    }
  }
  const opens = (template.match(open) || []).length;
  const closes = (template.match(/\{\{\/lang\s*\}\}/g) || []).length;
  if (opens !== closes && problems) {
    problems.push(`✘ ${templateName}: unbalanced {{#lang}}/{{/lang}} blocks (${opens} open, ${closes} close)`);
  }
  return template.replace(
    /[ \t]*\{\{#lang\s+([\w-]+)\s*\}\}[ \t]*\r?\n?([\s\S]*?)[ \t]*\{\{\/lang\s*\}\}[ \t]*\r?\n?/g,
    (_, lang, body) => (lang === variant.language ? body : "")
  );
}

function render(template, variant, problems, templateName) {
  const scoped = applyLangBlocks(template, variant, variant.id === VARIANTS[0].id ? problems : null, templateName);
  return scoped.replace(/\{\{\s*example:\s*([\w.-]+\/[\w.-]+)\s*\}\}/g, (_, id) => {
    return "```" + variant.fence + "\n" + regionFor(id, variant) + "\n```";
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
    for (const variant of VARIANTS) {
      try { regionFor(m[1], variant); }
      catch { problems.push(`✘ ${t}: {{ example: ${m[1]} }} has no ${variant.id} corpus region`); }
    }
  }
  for (const variant of VARIANTS) {
    const out = join(GUIDES_DIR, `${base}.${variant.id}.md`);
    const rendered = render(src, variant, problems, t);
    if (CHECK) {
      let current = "";
      try { current = readFileSync(out, "utf-8"); } catch { /* missing */ }
      if (current !== rendered) problems.push(`✘ ${base}.${variant.id}.md is stale — run \`pnpm render:guides\``);
    } else {
      writeFileSync(out, rendered);
      written++;
    }
  }
}

console.log(`Guide templates: ${templates.length} → ${templates.length * VARIANTS.length} per-variant builds`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(CHECK ? "All per-variant guide builds are current." : `Rendered ${written} build(s).`);
