#!/usr/bin/env node
// Structure-mirror gate (part of `pnpm check:examples`).
//
// Every human-docs page (docs/index.md + docs/getting-started/*.md) and every
// agent-guide template (guides/latest/*.template.md) must have an entry in
// scripts/sync-map.json — paired with its counterpart, or deliberately listed
// as unpaired. A file on disk with no entry fails the gate: whoever adds a
// page or guide decides its sync relationship right there, instead of the
// mapping living as hand-maintained prose in a skill.
//
// Map entries whose files don't exist on this branch are tolerated (warn
// only): the map is the union across the main and next channels, which don't
// always carry the same page set.

import { readFileSync, readdirSync, existsSync } from "node:fs";

const MAP_PATH = "scripts/sync-map.json";
const map = JSON.parse(readFileSync(MAP_PATH, "utf8"));

const pages = [
  "docs/index.md",
  ...readdirSync("docs/getting-started")
    .filter((f) => f.endsWith(".md"))
    .map((f) => `docs/getting-started/${f}`),
];
const templates = readdirSync("guides/latest")
  .filter((f) => f.endsWith(".template.md"))
  .map((f) => `guides/latest/${f}`);

const pairedPages = new Set(map.pairs.map((p) => p.page));
const pairedTemplates = new Set(map.pairs.map((p) => p.template));
const mappedPages = new Set([...pairedPages, ...map.unpairedPages]);
const mappedTemplates = new Set([...pairedTemplates, ...map.unpairedTemplates]);

const problems = [];

for (const p of pages) {
  if (!mappedPages.has(p)) {
    problems.push(
      `page with no sync-map entry: ${p} — add it to ${MAP_PATH} (pair it with its guide template, or list it under unpairedPages)`,
    );
  }
}
for (const t of templates) {
  if (!mappedTemplates.has(t)) {
    problems.push(
      `guide template with no sync-map entry: ${t} — add it to ${MAP_PATH} (pair it with its page, or list it under unpairedTemplates)`,
    );
  }
}

// An entry can't be both paired and deliberately unpaired.
for (const p of map.unpairedPages) {
  if (pairedPages.has(p)) problems.push(`${MAP_PATH} lists ${p} as both paired and unpaired`);
}
for (const t of map.unpairedTemplates) {
  if (pairedTemplates.has(t)) problems.push(`${MAP_PATH} lists ${t} as both paired and unpaired`);
}

let absent = 0;
for (const f of [...mappedPages, ...mappedTemplates]) {
  if (!existsSync(f)) {
    console.warn(`note: sync-map entry has no file on this branch (fine if it exists on the other channel): ${f}`);
    absent++;
  }
}

if (problems.length > 0) {
  console.error(`sync-map check FAILED (${problems.length} problem${problems.length === 1 ? "" : "s"}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(
  `sync-map check OK: ${map.pairs.length} pairs, ${map.unpairedPages.length} unpaired pages, ${map.unpairedTemplates.length} unpaired templates` +
    (absent ? `, ${absent} entr${absent === 1 ? "y" : "ies"} absent on this branch` : ""),
);
