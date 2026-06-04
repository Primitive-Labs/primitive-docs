// Inventory every code fence in the human docs and classify its platform
// parity. This is an *inventory*, not a gate: whether a lone-language block
// needs a counterpart is a judgment call ("where important"), so the output
// feeds the docs-page-review / docs-set-audit skills rather than failing CI.
//
//   node scripts/check-example-parity.mjs               # human-readable summary
//   node scripts/check-example-parity.mjs --json        # machine-readable
//   node scripts/check-example-parity.mjs docs/getting-started/workflows.md
//
// Classifications:
//   corpus-pair    ::: code-group with <<< includes for both ts and swift
//   inline-pair    ::: code-group with inline fences for both languages
//   mixed-pair     ::: code-group covering both languages via include + inline
//   lone-js        JS/TS fence with no Swift counterpart in the same group
//   lone-swift     Swift fence with no JS counterpart in the same group
//   neutral        bash / toml / json / text / vue / ruby / yaml etc.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = process.argv.includes("--json");
const fileArgs = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const JS_LANGS = new Set(["ts", "typescript", "js", "javascript", "vue"]);
const SWIFT_LANGS = new Set(["swift"]);

function docFiles() {
  if (fileArgs.length) return fileArgs.map((f) => join(ROOT, f));
  const dir = join(ROOT, "docs", "getting-started");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(dir, f));
  files.push(join(ROOT, "docs", "index.md"));
  return files.filter((f) => statSync(f).isFile());
}

// Parse a page into code-group containers and standalone fences/includes.
function analyze(path) {
  const lines = readFileSync(path, "utf-8").split("\n");
  const blocks = [];
  let group = null; // { startLine, langs:Set, includes:Set }
  let fence = null; // { lang, startLine }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ln = i + 1;

    if (fence) {
      if (/^```\s*$/.test(line)) {
        const langs = classifyLang(fence.lang);
        if (group) langs.forEach((l) => group.langs.add(l));
        else blocks.push({ line: fence.startLine, kind: "fence", lang: fence.lang });
        fence = null;
      }
      continue;
    }

    const open = line.match(/^```(\S*)/);
    if (open) {
      fence = { lang: (open[1] || "text").split("{")[0].toLowerCase(), startLine: ln };
      continue;
    }

    const inc = line.match(/^<<<\s+\S+\.(\w+)#/);
    if (inc) {
      const langs = classifyLang(inc[1]);
      if (group) {
        langs.forEach((l) => group.langs.add(l));
        group.includes.add(line.trim());
      } else blocks.push({ line: ln, kind: "include", lang: inc[1] });
      continue;
    }

    if (/^:::\s*code-group/.test(line)) {
      group = { startLine: ln, langs: new Set(), includes: new Set() };
      continue;
    }
    if (group && /^:::\s*$/.test(line)) {
      blocks.push({
        line: group.startLine,
        kind: "code-group",
        js: group.langs.has("js"),
        swift: group.langs.has("swift"),
        corpus: group.includes.size > 0,
      });
      group = null;
    }
  }
  return blocks;
}

function classifyLang(lang) {
  const l = (lang || "").toLowerCase();
  if (JS_LANGS.has(l)) return new Set(["js"]);
  if (SWIFT_LANGS.has(l)) return new Set(["swift"]);
  return new Set();
}

function classifyBlock(b) {
  if (b.kind === "code-group") {
    if (b.js && b.swift) return b.corpus ? "corpus-pair" : "inline-pair";
    if (b.js) return "lone-js";
    if (b.swift) return "lone-swift";
    return "neutral";
  }
  const langs = classifyLang(b.lang);
  if (langs.has("js")) return "lone-js";
  if (langs.has("swift")) return "lone-swift";
  return "neutral";
}

const report = [];
for (const file of docFiles()) {
  const rel = relative(ROOT, file);
  for (const b of analyze(file)) {
    report.push({ file: rel, line: b.line, classification: classifyBlock(b) });
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const lone = report.filter((r) => r.classification.startsWith("lone-"));
  const counts = {};
  for (const r of report) counts[r.classification] = (counts[r.classification] || 0) + 1;
  console.log("Code-fence parity inventory:");
  for (const [k, v] of Object.entries(counts).sort()) console.log(`  ${k.padEnd(12)} ${v}`);
  if (lone.length) {
    console.log(`\nLone-language blocks (judgment needed — does parity matter here?):`);
    for (const r of lone) console.log(`  ${r.file}:${r.line}  ${r.classification}`);
  }
}
