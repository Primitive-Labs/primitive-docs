// The docs channel: which library surface the validation gates run against.
//
//   "production" — the published packages (pinned devDependencies). The main
//                  branch is always this channel: published docs describe the
//                  released platform.
//   "next"       — the library_repos/* submodule sources (library main tips).
//                  The next branch is this channel: docs are trued against
//                  unreleased library work, then merged to main at a release
//                  SHA by the docs-publish-release skill.
//
// The channel is declared in docs-sources.json (written by stamp-sources.mjs
// --channel <id>), so it travels with the branch — scripts never guess from
// git state.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const CHANNELS = new Set(["production", "next"]);

export function docsChannel() {
  const stampPath = join(ROOT, "docs-sources.json");
  if (!existsSync(stampPath)) return "production";
  const channel = JSON.parse(readFileSync(stampPath, "utf-8")).channel ?? "production";
  if (!CHANNELS.has(channel)) {
    throw new Error(`docs-sources.json declares unknown channel "${channel}" (expected: ${[...CHANNELS].join(", ")})`);
  }
  return channel;
}

// The npm packages the next channel consumes from submodule source instead of
// the registry: package name → package dir inside library_repos/, plus the
// build artifact whose absence means "run pnpm build:source-packages".
export const SOURCE_PACKAGES = {
  "js-bao": { dir: "js-bao-wss/packages/js-bao", artifact: "dist/index.d.ts" },
  "js-bao-wss-client": { dir: "js-bao-wss/src/client", artifact: "dist/index.d.ts" },
  "primitive-admin": { dir: "js-bao-wss/cli", artifact: "dist/bin/primitive.js" },
};

export function sourcePackageDir(name) {
  return join(ROOT, "library_repos", SOURCE_PACKAGES[name].dir);
}

// Fail loudly when a next-channel gate would read an unbuilt source package.
export function assertSourcePackagesBuilt(names) {
  const missing = names.filter((n) => !existsSync(join(sourcePackageDir(n), SOURCE_PACKAGES[n].artifact)));
  if (missing.length) {
    throw new Error(
      `next channel: source package(s) not built: ${missing.join(", ")} — run \`pnpm build:source-packages\` first`,
    );
  }
}
