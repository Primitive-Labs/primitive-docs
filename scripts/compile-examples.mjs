#!/usr/bin/env node
// Compile-check the example corpus so the docs can't drift from the real
// clients. Each `examples/**/*.ts` (and, in a follow-up, `.swift`) is a
// COMPLETE, self-contained module — real imports + a typed function — so it
// compiles on its own. What the docs show is a `#region example` slice of a
// file that actually type-checks against the vendored client.
//
// TypeScript: type-checks every example file against
// `library_repos/js-bao-wss/src/client` (resolved as `js-bao-wss-client`).
// A snippet that calls a non-existent client method or passes the wrong shape
// fails the build.
//
// A file may opt out with a `// nocompile` line (e.g. framework-glue snippets
// that depend on app-template types not present in this repo) — those are
// reported as skipped, not silently passed.
//
// Usage:  node scripts/compile-examples.mjs

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { join, dirname, relative, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES_DIR = join(ROOT, "examples");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === "_harness" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const allFiles = walk(EXAMPLES_DIR);
const isSkipped = (f) => readFileSync(f, "utf-8").includes("// nocompile");
const failures = [];

// ── TypeScript ──────────────────────────────────────────────────────────────
const tsAll = allFiles.filter((f) => extname(f) === ".ts");
const tsCompile = tsAll.filter((f) => !isSkipped(f));
console.log(`TypeScript: ${tsCompile.length} file(s) to compile, ${tsAll.length - tsCompile.length} skipped (// nocompile)`);

if (tsCompile.length > 0) {
  const buildDir = join(EXAMPLES_DIR, "_harness", "ts", ".build");
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
          // `js-bao-wss-client` and `js-bao` resolve from the docs project's own
          // node_modules — the exact published versions the docs target
          // (js-bao-wss-client@2.0.0, js-bao@0.5.1). No path hacks.
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
    console.log("✓ TypeScript examples compile against js-bao-wss-client + js-bao.\n");
  } catch {
    failures.push("TypeScript");
    console.error("✘ TypeScript example compilation failed (see errors above).\n");
  }
}

// ── Swift ───────────────────────────────────────────────────────────────────
const swiftAll = allFiles.filter((f) => extname(f) === ".swift");
const swiftCompile = swiftAll.filter((f) => !isSkipped(f));
const haveSwift = (() => {
  try { execFileSync("swift", ["--version"], { stdio: "ignore" }); return true; }
  catch { return false; }
})();

console.log(`Swift: ${swiftCompile.length} file(s) to compile, ${swiftAll.length - swiftCompile.length} skipped (// nocompile)`);
if (swiftCompile.length > 0 && !haveSwift) {
  console.log("  (swift toolchain not found — skipping Swift compile gate)\n");
} else if (swiftCompile.length > 0) {
  const pkgDir = join(EXAMPLES_DIR, "_harness", "swift");
  const srcDir = join(pkgDir, "Sources", "DocsExamples");
  // Assemble the target: fixture schema (drives codegen) + every example file.
  rmSync(srcDir, { recursive: true, force: true });
  mkdirSync(srcDir, { recursive: true });
  cpSync(join(EXAMPLES_DIR, "_harness", "schema.toml"), join(srcDir, "schema.toml"));
  for (const f of swiftCompile) {
    const flat = relative(EXAMPLES_DIR, f).replace(/[/\\]/g, "__");
    cpSync(f, join(srcDir, flat));
  }
  try {
    execFileSync("swift", ["build"], { cwd: pkgDir, stdio: "inherit" });
    console.log("✓ Swift examples compile against the vendored swift-client.\n");
  } catch {
    failures.push("Swift");
    console.error("✘ Swift example compilation failed (see errors above).\n");
  }
}

if (failures.length) {
  console.error(`Example compilation failed: ${failures.join(", ")}.`);
  process.exit(1);
}
console.log("All examples compile.");
