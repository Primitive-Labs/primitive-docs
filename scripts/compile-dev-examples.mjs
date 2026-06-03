#!/usr/bin/env node
// Compile-check the DEV-REFERENCE snippet corpus (`dev-docs/snippets/**`).
//
// Same idea as scripts/compile-examples.mjs — every snippet is a complete,
// self-contained module that type-checks against the real vendored clients —
// but with ONE difference: parity is RELAXED. A snippet id may exist as `.ts`
// only, `.swift` only, or both. This is deliberate: the dev cookbook documents
// the ENTIRE client surface, including JS-only / Swift-divergent APIs that
// cannot be written in both languages. Each id just has to compile in whatever
// language(s) it ships.
//
// TS resolves `js-bao-wss-client` / `js-bao` from the project's node_modules
// (published versions). Swift compiles against the vendored swift-client via
// the shared examples/_harness/swift SPM package (same harness as the main
// corpus — model structs are codegen'd from examples/_harness/schema.toml).
//
// A file may opt out with `// nocompile`.
//
// Usage:  node scripts/compile-dev-examples.mjs

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNIPPETS_DIR = join(ROOT, "dev-docs", "snippets");
const HARNESS = join(ROOT, "examples", "_harness");

if (!existsSync(SNIPPETS_DIR)) {
  console.log("No dev-docs/snippets/ yet — nothing to compile.");
  process.exit(0);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const allFiles = walk(SNIPPETS_DIR);
const isSkipped = (f) => readFileSync(f, "utf-8").includes("// nocompile");

// ── Coverage report (relaxed parity: report, never fail on a missing language) ─
const byId = new Map(); // id -> Set(lang)
for (const f of allFiles) {
  const ext = extname(f);
  if (ext !== ".ts" && ext !== ".swift") continue;
  const id = relative(SNIPPETS_DIR, f).replace(/\.(ts|swift)$/, "");
  if (!byId.has(id)) byId.set(id, new Set());
  byId.get(id).add(ext === ".ts" ? "ts" : "swift");
}
let dual = 0, tsOnly = 0, swiftOnly = 0;
for (const langs of byId.values()) {
  if (langs.has("ts") && langs.has("swift")) dual++;
  else if (langs.has("ts")) tsOnly++;
  else swiftOnly++;
}
console.log(`Snippets: ${byId.size} id(s) — ${dual} dual, ${tsOnly} ts-only, ${swiftOnly} swift-only\n`);

const failures = [];

// ── TypeScript ────────────────────────────────────────────────────────────────
const tsCompile = allFiles.filter((f) => extname(f) === ".ts" && !isSkipped(f));
console.log(`TypeScript: ${tsCompile.length} file(s) to compile`);
if (tsCompile.length > 0) {
  const buildDir = join(HARNESS, "ts", ".build-dev");
  mkdirSync(buildDir, { recursive: true });
  const tsconfigPath = join(buildDir, "tsconfig.gen.json");
  writeFileSync(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          noEmit: true,
          strict: true,
          skipLibCheck: true,
          module: "esnext",
          target: "es2022",
          moduleResolution: "bundler",
          types: [],
        },
        files: tsCompile,
      },
      null,
      2,
    ),
  );
  try {
    execFileSync("npx", ["tsc", "-p", tsconfigPath], { cwd: ROOT, stdio: "inherit" });
    console.log("✓ TypeScript snippets compile against js-bao-wss-client + js-bao.\n");
  } catch {
    failures.push("TypeScript");
    console.error("✘ TypeScript snippet compilation failed (see errors above).\n");
  }
}

// ── Swift ─────────────────────────────────────────────────────────────────────
const swiftCompile = allFiles.filter((f) => extname(f) === ".swift" && !isSkipped(f));
const haveSwift = (() => {
  try { execFileSync("swift", ["--version"], { stdio: "ignore" }); return true; }
  catch { return false; }
})();
console.log(`Swift: ${swiftCompile.length} file(s) to compile`);
if (swiftCompile.length > 0 && !haveSwift) {
  console.log("  (swift toolchain not found — skipping Swift compile gate)\n");
} else if (swiftCompile.length > 0) {
  const pkgDir = join(HARNESS, "swift");
  const srcDir = join(pkgDir, "Sources", "DocsExamples");
  rmSync(srcDir, { recursive: true, force: true });
  mkdirSync(srcDir, { recursive: true });
  cpSync(join(HARNESS, "schema.toml"), join(srcDir, "schema.toml"));
  for (const f of swiftCompile) {
    const rel = relative(SNIPPETS_DIR, f);
    const flat = rel.replace(/[/\\]/g, "__");
    // The whole corpus compiles as ONE flat module, so every snippet's
    // top-level function must have a globally-unique name. Snippet authors
    // name the function after the method (`func list(...)`), which collides
    // across sub-APIs — so rewrite it to a path-unique name on copy. The
    // signature lives OUTSIDE the `#region example` slice shown in the docs,
    // so this rename is invisible to readers.
    const uniqueFn = rel.replace(/\.swift$/, "").replace(/[^A-Za-z0-9]/g, "_");
    let content = readFileSync(f, "utf-8");
    content = content.replace(/(\bfunc\s+)([A-Za-z_]\w*)(\s*[(<])/, `$1${uniqueFn}$3`);
    writeFileSync(join(srcDir, flat), content);
  }
  try {
    execFileSync("swift", ["build"], { cwd: pkgDir, stdio: "inherit" });
    console.log("✓ Swift snippets compile against the vendored swift-client.\n");
  } catch {
    failures.push("Swift");
    console.error("✘ Swift snippet compilation failed (see errors above).\n");
  }
}

if (failures.length) {
  console.error(`Dev-snippet compilation failed: ${failures.join(", ")}.`);
  process.exit(1);
}
console.log("All dev snippets compile.");
