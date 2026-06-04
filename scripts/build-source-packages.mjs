#!/usr/bin/env node
// Build the npm packages that the next channel's validation gates consume
// from submodule SOURCE instead of the registry (see scripts/channel.mjs):
//
//   js-bao             → packages/js-bao        (types + codegen-v2 CLI)
//   js-bao-wss-client  → src/client             (types; ESM build is enough)
//   primitive-admin    → cli                    (dist/bin/primitive.js)
//
// One workspace install at the js-bao-wss root, then per-package builds in
// dependency order. Idempotent — safe to re-run after a submodule
// fast-forward. The production channel never needs this (its gates read the
// installed pinned packages).
//
// Usage:  node scripts/build-source-packages.mjs  (pnpm build:source-packages)

import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, SOURCE_PACKAGES, sourcePackageDir } from "./channel.mjs";
import { run } from "./utils.mjs";

const WSS = join(ROOT, "library_repos", "js-bao-wss");
if (!existsSync(join(WSS, "package.json"))) {
  console.error("✘ library_repos/js-bao-wss is not initialized — run `pnpm submodules:init` first");
  process.exit(1);
}

console.log("Installing js-bao-wss workspace dependencies…");
run("pnpm", ["install", "--frozen-lockfile"], { cwd: WSS });

// js-bao first: the client and CLI may resolve it from the workspace.
console.log("\nBuilding js-bao (packages/js-bao)…");
run("pnpm", ["--dir", join(WSS, "packages", "js-bao"), "build"]);

console.log("\nBuilding js-bao-wss-client (src/client)…");
run("pnpm", ["--dir", join(WSS, "src", "client"), "build:esm"]);

console.log("\nBuilding primitive-admin (cli)…");
run("pnpm", ["--dir", join(WSS, "cli"), "build"]);

// js-bao's build runs its codegen, which rewrites tracked demo fixtures inside
// the submodule. library_repos/* are read-only source mirrors — restore any
// tracked files the builds touched (dist outputs are gitignored and survive).
run("git", ["-C", WSS, "checkout", "--", "."]);

const missing = Object.entries(SOURCE_PACKAGES).filter(
  ([name, cfg]) => !existsSync(join(sourcePackageDir(name), cfg.artifact)),
);
if (missing.length) {
  console.error(`✘ build completed but artifacts missing: ${missing.map(([n]) => n).join(", ")}`);
  process.exit(1);
}
console.log("\n✓ Source packages built (js-bao, js-bao-wss-client, primitive-admin).");
