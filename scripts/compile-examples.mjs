#!/usr/bin/env node
// Compile-check the example corpus so the docs can't drift from the real
// clients. Each corpus file is a COMPLETE, self-contained module — real
// imports + a typed function — so it compiles on its own. What the docs show
// is a `#region example` slice of a file that actually type-checks against the
// vendored client.
//
// Files are grouped by their variant's `harness` (scripts/variants.mjs):
//
//   "ts"          — type-checks against `js-bao-wss-client` + `js-bao`. On the
//                   production channel these resolve from the docs project's
//                   node_modules (the published pinned packages); on the next
//                   channel an `examples/node_modules/` symlink shadow points
//                   them at the built submodule packages instead (see
//                   scripts/channel.mjs; build with `pnpm build:source-packages`)
//   "swift-macos" — `swift build` in examples/_harness/swift (always the
//                   vendored submodule swift-client — source-based on both
//                   channels; the pinned submodule commit selects the surface)
//   null          — no compile gate declared yet; loudly enumerated as
//                   uncompiled (never silently skipped)
//
// A file may opt out with a `// nocompile` line (e.g. framework-glue snippets
// that depend on app-template types not present in this repo) — those are
// reported as skipped, not silently passed.
//
// Usage:  node scripts/compile-examples.mjs

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, rmSync, cpSync, symlinkSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { parseExampleFile } from "./variants.mjs";
import { ROOT, docsChannel, assertSourcePackagesBuilt, sourcePackageDir } from "./channel.mjs";

const EXAMPLES_DIR = join(ROOT, "examples");
const CHANNEL = docsChannel();

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    // `_harness/` holds the compile scaffolding; `node_modules/` is the
    // next channel's symlink shadow — neither is corpus.
    if (name === "_harness" || name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const isSkipped = (f) => readFileSync(f, "utf-8").includes("// nocompile");
const failures = [];

// ── Group corpus files by compile harness ──────────────────────────────────
const byHarness = new Map(); // harnessId | null -> file[]
for (const file of walk(EXAMPLES_DIR)) {
  let parsed;
  try {
    parsed = parseExampleFile(relative(EXAMPLES_DIR, file));
  } catch (err) {
    failures.push("corpus");
    console.error(`✘ ${err.message}`);
    continue;
  }
  if (!parsed) continue; // not a corpus file
  const harness = parsed.variant.harness;
  if (!byHarness.has(harness)) byHarness.set(harness, []);
  byHarness.get(harness).push(file);
}

// ── Harness: ts ─────────────────────────────────────────────────────────────
const tsAll = byHarness.get("ts") ?? [];
const tsCompile = tsAll.filter((f) => !isSkipped(f));
console.log(`TypeScript: ${tsCompile.length} file(s) to compile, ${tsAll.length - tsCompile.length} skipped (// nocompile)`);

if (tsCompile.length > 0) {
  // Channel routing: examples import `js-bao` / `js-bao-wss-client` bare.
  // Module resolution walks up from examples/<subject>/, so a symlink shadow
  // at examples/node_modules/ overrides the root install for example files
  // only. Next channel: create it (pointing at the built submodule packages);
  // production: remove it so a stale shadow can't mask the published surface.
  const shadowDir = join(EXAMPLES_DIR, "node_modules");
  rmSync(shadowDir, { recursive: true, force: true });
  if (CHANNEL === "next") {
    assertSourcePackagesBuilt(["js-bao", "js-bao-wss-client"]);
    mkdirSync(shadowDir, { recursive: true });
    for (const pkg of ["js-bao", "js-bao-wss-client"]) {
      symlinkSync(sourcePackageDir(pkg), join(shadowDir, pkg), "dir");
    }
  }

  // (Re)generate the fixture model classes the TS examples import — the
  // generated output is gitignored, so the gate must produce it itself
  // (locally and on CI). The codegen CLI must match the channel's js-bao.
  const codegen =
    CHANNEL === "next"
      ? ["node", join(sourcePackageDir("js-bao"), "dist", "codegen-v2.cjs")]
      : ["npx", "js-bao-codegen-v2"];
  execFileSync(
    codegen[0],
    [...codegen.slice(1), "generate", "-i", join(EXAMPLES_DIR, "_harness", "schema.toml"), "-o", join(EXAMPLES_DIR, "_harness", "generated", "ts")],
    { cwd: ROOT, stdio: "inherit" },
  );
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
          // `js-bao-wss-client` and `js-bao` resolve by normal node_modules
          // walking: the published pinned packages from the root install on
          // the production channel, or the built submodule packages via the
          // examples/node_modules shadow on the next channel. No path hacks.
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
    console.log(
      `✓ TypeScript examples compile against js-bao-wss-client + js-bao (${CHANNEL === "next" ? "submodule source" : "published packages"}).\n`,
    );
  } catch {
    failures.push("TypeScript");
    console.error("✘ TypeScript example compilation failed (see errors above).\n");
  }
}

// ── Harness: swift-macos ────────────────────────────────────────────────────
const swiftAll = byHarness.get("swift-macos") ?? [];
const swiftCompile = swiftAll.filter((f) => !isSkipped(f));
// The harness depends on the vendored swift-client, whose yswift/UniFFI
// scaffold only builds on Apple platforms — a Linux swift toolchain (present
// on GitHub ubuntu runners) can't compile it. Require a macOS host.
const haveSwift = process.platform === "darwin" && (() => {
  try { execFileSync("swift", ["--version"], { stdio: "ignore" }); return true; }
  catch { return false; }
})();

console.log(`Swift: ${swiftCompile.length} file(s) to compile, ${swiftAll.length - swiftCompile.length} skipped (// nocompile)`);
if (swiftCompile.length > 0 && !haveSwift) {
  console.log("  (Swift compile gate needs a macOS host with the swift toolchain — SKIPPED here; covered locally and by the macOS CI job)\n");
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

// ── Harness: none declared ──────────────────────────────────────────────────
const unharnessed = byHarness.get(null) ?? [];
if (unharnessed.length > 0) {
  console.log(`Uncompiled (no harness declared in variants.mjs): ${unharnessed.length} file(s)`);
  for (const f of unharnessed) console.log(`  - ${relative(ROOT, f)}`);
  console.log("");
}

if (failures.length) {
  console.error(`Example compilation failed: ${failures.join(", ")}.`);
  process.exit(1);
}
console.log("All examples compile.");
