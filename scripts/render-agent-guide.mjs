#!/usr/bin/env node
// Merge a variant into an agent-guide TEMPLATE — the repo-side stand-in for the
// CLI's eventual "fetch the guide for the project's language/platform".
//
// A guide template (`AGENT_GUIDE_TO_PRIMITIVE_X.template.md`) is variant-neutral
// prose with example placeholders:
//
//     {{ example: documents/model-create }}
//
// This script fills each placeholder with the corpus region for the requested
// variant (`--lang <variantId>`, any id declared in scripts/variants.mjs;
// platform variants fall back to the base-language example file when no
// platform override exists) and writes the rendered guide. Anything that
// isn't a placeholder (including not-yet-migrated inline code blocks) is copied
// through unchanged, so templatization can proceed incrementally without ever
// breaking the served guide.
//
// Usage:
//   node scripts/render-agent-guide.mjs <template.md> --lang ts   [--out <file>]
//   node scripts/render-agent-guide.mjs <template.md> --lang swift [--out <file>]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { variantById, exampleCandidates, DEFAULT_VARIANT_ID } from "./variants.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES_DIR = join(ROOT, "examples");

const [templatePath, ...rest] = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i !== -1 && rest[i + 1] ? rest[i + 1] : fallback;
};
const lang = getArg("lang", DEFAULT_VARIANT_ID);
if (!templatePath || !variantById.has(lang)) {
  console.error(`usage: render-agent-guide.mjs <template.md> --lang <${[...variantById.keys()].join("|")}> [--out <file>]`);
  process.exit(2);
}
const variant = variantById.get(lang);

function region(id, region = "example") {
  const candidates = exampleCandidates(variant, id).map((p) => join(EXAMPLES_DIR, p));
  const file = candidates.find((p) => existsSync(p)) ?? candidates[candidates.length - 1];
  const lines = readFileSync(file, "utf-8").split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`//\\s*#region\\s+${region}\\b`).test(l));
  const end = lines.findIndex((l) => new RegExp(`//\\s*#endregion\\s+${region}\\b`).test(l));
  if (start === -1 || end === -1 || end <= start) throw new Error(`region '${region}' not found in ${file}`);
  return lines.slice(start + 1, end).join("\n");
}

const template = readFileSync(templatePath, "utf-8");
// `{{ example: <subject>/<name> }}` — id must be a real path (ignores prose).
const rendered = template.replace(/\{\{\s*example:\s*([\w.-]+\/[\w.-]+)\s*\}\}/g, (_, id) => {
  return "```" + variant.fence + "\n" + region(id) + "\n```";
});

// Explicit per-variant outputs: <base>.<variantId>.md (all committed;
// guides.json lists every build so the CLI fetches the project's variant).
const base = basename(templatePath).replace(/\.template\.md$/, "");
const defaultOut = join(dirname(templatePath), `${base}.${lang}.md`);
const out = getArg("out", defaultOut);
writeFileSync(out, rendered);
console.log(`Rendered ${basename(out)} (variant=${lang}) from ${basename(templatePath)}.`);
