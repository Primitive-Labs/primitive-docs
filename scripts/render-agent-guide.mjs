#!/usr/bin/env node
// Merge a language into an agent-guide TEMPLATE — the repo-side stand-in for the
// CLI's eventual "fetch the guide in the project's language" behavior.
//
// A guide template (`AGENT_GUIDE_TO_PRIMITIVE_X.template.md`) is language-neutral
// prose with example placeholders:
//
//     {{ example: documents/model-create }}
//
// This script fills each placeholder with the corpus region for the requested
// language (`--lang ts|swift`) and writes the rendered guide. Anything that
// isn't a placeholder (including not-yet-migrated inline code blocks) is copied
// through unchanged, so templatization can proceed incrementally without ever
// breaking the served guide.
//
// Usage:
//   node scripts/render-agent-guide.mjs <template.md> --lang ts   [--out <file>]
//   node scripts/render-agent-guide.mjs <template.md> --lang swift [--out <file>]

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES_DIR = join(ROOT, "examples");

const EXT_BY_LANG = { ts: "ts", swift: "swift" };
const FENCE_BY_LANG = { ts: "typescript", swift: "swift" };

const [templatePath, ...rest] = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i !== -1 && rest[i + 1] ? rest[i + 1] : fallback;
};
const lang = getArg("lang", "ts");
if (!templatePath || !EXT_BY_LANG[lang]) {
  console.error("usage: render-agent-guide.mjs <template.md> --lang <ts|swift> [--out <file>]");
  process.exit(2);
}

function region(id, region = "example") {
  const file = join(EXAMPLES_DIR, `${id}.${EXT_BY_LANG[lang]}`);
  const lines = readFileSync(file, "utf-8").split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`//\\s*#region\\s+${region}\\b`).test(l));
  const end = lines.findIndex((l) => new RegExp(`//\\s*#endregion\\s+${region}\\b`).test(l));
  if (start === -1 || end === -1 || end <= start) throw new Error(`region '${region}' not found in ${file}`);
  return lines.slice(start + 1, end).join("\n");
}

const template = readFileSync(templatePath, "utf-8");
// `{{ example: <subject>/<name> }}` — id must be a real path (ignores prose).
const rendered = template.replace(/\{\{\s*example:\s*([\w.-]+\/[\w.-]+)\s*\}\}/g, (_, id) => {
  return "```" + FENCE_BY_LANG[lang] + "\n" + region(id) + "\n```";
});

// Explicit per-language outputs: <base>.ts.md and <base>.swift.md (both committed;
// guides.json lists both so the CLI fetches the project's language).
const base = basename(templatePath).replace(/\.template\.md$/, "");
const defaultOut = join(dirname(templatePath), `${base}.${lang}.md`);
const out = getArg("out", defaultOut);
writeFileSync(out, rendered);
console.log(`Rendered ${basename(out)} (lang=${lang}) from ${basename(templatePath)}.`);
