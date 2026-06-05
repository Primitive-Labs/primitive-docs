#!/usr/bin/env node
// Validate every ```toml block in the docs against the SAME validators the
// platform runs, so TOML examples can't drift from what `primitive sync push`
// and the server actually accept (the TOML analogue of compile-examples.mjs).
//
// Sources scanned:
//   • guides/latest/*.template.md  (+ non-templated guides; rendered
//     .<variantId>.md builds are skipped — they duplicate the templates)
//   • docs/getting-started/*.md
//
// Per block, by classification:
//   workflow   (`steps` present)               → validateWorkflowToml()
//   database   (`type`/`operations`/`subscriptions`) →
//                normalizeOperationFromToml() + validateOperations()
//                (+ models subtree via loadSchemaFromTomlString strict)
//   schema     (`models` only)                  → loadSchemaFromTomlString({strict})
//   other                                       → parse gate only
//
// The workflow/operations validators are the CLI's own `sync push` validators,
// imported from its public `validators` export: the submodule-built CLI on the
// next channel, the installed `primitive-admin/validators` on production (with
// a transpile-from-submodule fallback while the pinned published CLI predates
// the export). The database-config normalizers aren't part of the export, so
// they always transpile from the submodule source.
//
// A block opts out with `novalidate` in the fence info string
// (```toml novalidate) — e.g. deliberately-wrong teaching snippets. Opt-outs
// are listed loudly, never silently skipped.
//
// Usage:  node scripts/check-toml.mjs

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import TOML from "@iarna/toml";
import { loadSchemaFromTomlString } from "js-bao";
import ts from "typescript";
import { VARIANTS } from "./variants.mjs";
import { docsChannel } from "./channel.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLI_LIB = join(ROOT, "library_repos", "js-bao-wss", "cli", "src", "lib");
const BUILD_DIR = join(ROOT, "scripts", ".build");

// ── Transpile + import the CLI's sync-push validators from the submodule ────
async function importCliLib(name) {
  const src = readFileSync(join(CLI_LIB, `${name}.ts`), "utf-8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  mkdirSync(BUILD_DIR, { recursive: true });
  const out = join(BUILD_DIR, `${name}.mjs`);
  writeFileSync(out, js);
  return import(pathToFileURL(out).href);
}

// ── Channel-resolved validators export (js-bao-wss#983) ─────────────────────
async function importValidators() {
  if (docsChannel() === "next") {
    const built = join(ROOT, "library_repos", "js-bao-wss", "cli", "dist", "src", "validators.js");
    if (!existsSync(built)) {
      console.error("✘ next channel: submodule CLI not built — run `pnpm build:source-packages`");
      process.exit(1);
    }
    return import(pathToFileURL(built).href);
  }
  try {
    return await import("primitive-admin/validators");
  } catch {
    // Pinned published CLI predates the export — transpile the same sources.
    const [wf, params] = await Promise.all([
      importCliLib("workflow-toml-validator"),
      importCliLib("toml-params-validator"),
    ]);
    return { ...wf, ...params };
  }
}

const { validateWorkflowToml, validateOperations } = await importValidators();
const { normalizeOperationFromToml, normalizeSubscriptionFromToml } =
  await importCliLib("toml-database-config");

// Registry-derived step kinds: every `kind: "<x>"` literal in the step-runner
// sources, plus the `database.*` / `document.*` kinds (declared as type unions
// in runner/types.ts and instantiated programmatically). Catches documented
// steps with a missing/unknown/renamed `kind`.
const WORKFLOWS_SRC = join(ROOT, "library_repos", "js-bao-wss", "src", "workflows");
const STEPS_DIR = join(WORKFLOWS_SRC, "steps");
const KNOWN_KINDS = new Set([
  ...readdirSync(STEPS_DIR)
    .filter((f) => f.endsWith(".ts"))
    .flatMap((f) =>
      [...readFileSync(join(STEPS_DIR, f), "utf-8").matchAll(/kind: "([\w.-]+)"/g)].map((m) => m[1]),
    ),
  ...[...readFileSync(join(WORKFLOWS_SRC, "runner", "types.ts"), "utf-8").matchAll(/"((?:database|document)\.\w+)"/g)].map(
    (m) => m[1],
  ),
]);

function checkStepKinds(steps, loc) {
  if (!Array.isArray(steps)) return;
  for (const [i, step] of steps.entries()) {
    if (step === null || typeof step !== "object" || Array.isArray(step)) continue;
    const where = step.id ? `step '${step.id}'` : `step #${i + 1}`;
    if (step.kind === undefined) {
      problems.push(`✘ ${loc}: workflow ${where} has no \`kind\` (the engine resolves steps by \`kind\`)`);
    } else if (!KNOWN_KINDS.has(step.kind)) {
      problems.push(`✘ ${loc}: workflow ${where} has unknown kind '${step.kind}' (not in the step-runner registry)`);
    }
    if (step.step) checkStepKinds([step.step], loc); // collect's nested step
  }
}

// ── Collect markdown sources ────────────────────────────────────────────────
const renderedSuffix = new RegExp(`\\.(${VARIANTS.map((v) => v.id).join("|")})\\.md$`);
const sources = [
  ...readdirSync(join(ROOT, "guides", "latest"))
    .filter((f) => f.endsWith(".md") && !renderedSuffix.test(f))
    .map((f) => join(ROOT, "guides", "latest", f)),
  ...readdirSync(join(ROOT, "docs", "getting-started"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(ROOT, "docs", "getting-started", f)),
];

// ── Extract + validate blocks ───────────────────────────────────────────────
const problems = [];
const skipped = [];
const counts = { workflow: 0, database: 0, schema: 0, other: 0 };

const FENCE = /^```toml([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm;

function classify(parsed) {
  if (parsed.steps !== undefined) return "workflow";
  if (parsed.type !== undefined || parsed.operations !== undefined || parsed.subscriptions !== undefined)
    return "database";
  if (parsed.models !== undefined) return "schema";
  return "other";
}

function checkSchemaModels(parsed, loc) {
  try {
    loadSchemaFromTomlString(TOML.stringify({ models: parsed.models }), { strict: true });
  } catch (err) {
    problems.push(`✘ ${loc}: schema — ${err.message}`);
  }
}

for (const file of sources) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, "utf-8");
  for (const m of text.matchAll(FENCE)) {
    const line = text.slice(0, m.index).split("\n").length + 1; // first line inside the fence
    const loc = `${rel}:${line}`;
    const info = m[1].trim();
    const block = m[2];

    if (/\bnovalidate\b/.test(info)) {
      skipped.push(loc);
      continue;
    }

    let parsed;
    try {
      parsed = TOML.parse(block);
    } catch (err) {
      problems.push(`✘ ${loc}: TOML parse error — ${err.message.split("\n")[0]}`);
      continue;
    }

    const kind = classify(parsed);
    counts[kind]++;

    if (kind === "workflow") {
      for (const e of validateWorkflowToml(parsed)) {
        const where = e.stepId ? `step '${e.stepId}'` : `step #${e.stepIndex + 1}`;
        problems.push(`✘ ${loc}: workflow ${where}, field '${e.field}' — ${e.hint}`);
      }
      checkStepKinds(parsed.steps, loc);
    } else if (kind === "database") {
      let operations = [];
      try {
        operations = (parsed.operations ?? []).map(normalizeOperationFromToml);
      } catch (err) {
        problems.push(`✘ ${loc}: database operations — ${err.message}`);
      }
      const { errors } = validateOperations({ filePath: loc, rawToml: block, operations });
      for (const e of errors) problems.push(`✘ ${loc} (op '${e.op}'): ${e.message}`);
      for (const sub of parsed.subscriptions ?? []) {
        try { normalizeSubscriptionFromToml(sub); }
        catch (err) { problems.push(`✘ ${loc}: subscription — ${err.message}`); }
      }
      if (parsed.models !== undefined) checkSchemaModels(parsed, loc);
    } else if (kind === "schema") {
      checkSchemaModels(parsed, loc);
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
const total = counts.workflow + counts.database + counts.schema + counts.other;
console.log(
  `TOML blocks: ${total} validated (${counts.workflow} workflow, ${counts.database} database, ` +
    `${counts.schema} schema, ${counts.other} parse-only)` +
    (skipped.length ? `, ${skipped.length} opted out (novalidate)` : ""),
);
for (const s of skipped) console.log(`  ~ skipped ${s}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("All TOML examples are valid.");
