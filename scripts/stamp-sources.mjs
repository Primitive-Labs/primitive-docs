#!/usr/bin/env node
// Stamp the library sources the docs were last validated against, so the next
// doc-truing pass can scan exactly what changed since.
//
//   docs-sources.json        — repo-root stamp: per-library submodule commit +
//                              the npm versions the validation gates ran against
//   guides.json builtAgainst — published package versions + stamp date only
//                              (no private-repo commits in published surfaces)
//
// Modes:
//   node scripts/stamp-sources.mjs                  # (re)write the stamp from current state
//   node scripts/stamp-sources.mjs --channel next   # …and switch the declared channel
//   node scripts/stamp-sources.mjs --check          # CI gate: stamp matches submodule HEADs
//                                                   # + gate-relevant versions + guides.json
//   node scripts/stamp-sources.mjs --changes        # per-library `git log <stamped>..origin/main`
//                                                   # to scan for doc-impacting changes
//
// npm versions record what the validation gates actually ran against — never
// the registry, so --check stays deterministic. On the production channel
// that's the INSTALLED pinned packages (or the submodule's package.json for
// packages not installed here); on the next channel every package reads from
// the submodule source the gates compile/spawn (see scripts/channel.mjs).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, CHANNELS, docsChannel } from "./channel.mjs";

const STAMP_PATH = join(ROOT, "docs-sources.json");
const GUIDES_JSON = join(ROOT, "guides", "latest", "guides.json");
const MODE = process.argv.includes("--check")
  ? "check"
  : process.argv.includes("--changes")
    ? "changes"
    : "write";

// Channel: --channel flag (write mode) wins; otherwise whatever the existing
// stamp declares. The flag is how a branch flips channel (publish/backflow).
const channelFlag = process.argv.indexOf("--channel");
const CHANNEL = channelFlag !== -1 ? process.argv[channelFlag + 1] : docsChannel();
if (!CHANNELS.has(CHANNEL)) {
  console.error(`✘ unknown channel "${CHANNEL}" (expected: ${[...CHANNELS].join(", ")})`);
  process.exit(1);
}

// Library repo → the npm packages that represent it in the docs' validation
// gates. `installed` = on the production channel, read from this repo's
// node_modules (pinned devDep); `source` = the package.json inside the
// submodule (always used on the next channel, and on production for packages
// not installed here).
const LIBRARIES = {
  "js-bao-wss": {
    packages: {
      "js-bao-wss-client": { installed: true, source: "src/client/package.json" },
      "js-bao": { installed: true, source: "packages/js-bao/package.json" },
      "primitive-admin": { installed: true, source: "cli/package.json" },
    },
  },
  "primitive-app-dev": {
    packages: { "primitive-app": { source: "primitive-app/package.json" } },
  },
  "swift-primitive-app-dev": { packages: {} }, // Swift package — commit only
};

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function currentState(channel) {
  const libraries = {};
  for (const [name, cfg] of Object.entries(LIBRARIES)) {
    const dir = join(ROOT, "library_repos", name);
    const commit = git(["rev-parse", "HEAD"], dir);
    const npm = {};
    for (const [pkg, src] of Object.entries(cfg.packages)) {
      const useInstalled = channel === "production" && src.installed;
      const pkgJson = useInstalled ? join(ROOT, "node_modules", pkg, "package.json") : join(dir, src.source);
      npm[pkg] = readJson(pkgJson).version;
    }
    libraries[name] = Object.keys(npm).length ? { commit, npm } : { commit };
  }
  return libraries;
}

function mergedPackages(libraries) {
  const packages = {};
  for (const lib of Object.values(libraries)) Object.assign(packages, lib.npm ?? {});
  return packages;
}

// ── write ────────────────────────────────────────────────────────────────────
if (MODE === "write") {
  const libraries = currentState(CHANNEL);
  const stamp = { channel: CHANNEL, stampedAt: new Date().toISOString().slice(0, 10), libraries };
  writeFileSync(STAMP_PATH, JSON.stringify(stamp, null, 2) + "\n");

  // Mirror package versions (no commits) into the guides manifest.
  const manifest = readJson(GUIDES_JSON);
  const out = {
    defaults: manifest.defaults,
    platforms: manifest.platforms,
    builtAgainst: { stampedAt: stamp.stampedAt, channel: CHANNEL, packages: mergedPackages(libraries) },
    guides: manifest.guides,
  };
  writeFileSync(GUIDES_JSON, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `Stamped ${Object.keys(libraries).length} libraries (${stamp.stampedAt}, channel: ${CHANNEL}) → docs-sources.json + guides.json builtAgainst.`,
  );
}

// ── check ────────────────────────────────────────────────────────────────────
if (MODE === "check") {
  const problems = [];
  if (!existsSync(STAMP_PATH)) {
    problems.push("✘ docs-sources.json missing — run `pnpm stamp:sources`");
  } else {
    const stamp = readJson(STAMP_PATH);
    // The stamp's own channel governs the check: gates and stamp must agree
    // on which surface (installed packages vs submodule source) they read.
    const channel = stamp.channel ?? "production";
    const now = currentState(channel);
    for (const [name, lib] of Object.entries(now)) {
      const stamped = stamp.libraries?.[name];
      if (!stamped) {
        problems.push(`✘ ${name}: not in docs-sources.json`);
        continue;
      }
      if (stamped.commit !== lib.commit) {
        problems.push(`✘ ${name}: submodule at ${lib.commit.slice(0, 8)} but stamped ${String(stamped.commit).slice(0, 8)}`);
      }
      for (const [pkg, version] of Object.entries(lib.npm ?? {})) {
        if (stamped.npm?.[pkg] !== version) {
          problems.push(`✘ ${name}: ${pkg} is ${version} but stamped ${stamped.npm?.[pkg] ?? "<missing>"}`);
        }
      }
    }
    const built = readJson(GUIDES_JSON).builtAgainst;
    const expected = { stampedAt: stamp.stampedAt, channel, packages: mergedPackages(now) };
    if (JSON.stringify(built) !== JSON.stringify(expected)) {
      problems.push("✘ guides.json builtAgainst doesn't match docs-sources.json");
    }
  }
  if (problems.length) {
    console.error(`${problems.length} problem(s):`);
    for (const p of problems) console.error("  " + p);
    console.error("  Fix with `pnpm stamp:sources` (after verifying docs against the new sources).");
    process.exit(1);
  }
  console.log("docs-sources.json matches submodules, installed packages, and guides.json.");
}

// ── changes ──────────────────────────────────────────────────────────────────
if (MODE === "changes") {
  if (!existsSync(STAMP_PATH)) {
    console.error("✘ docs-sources.json missing — run `pnpm stamp:sources` first");
    process.exit(1);
  }
  const stamp = readJson(STAMP_PATH);
  console.log(`Library commits since the ${stamp.stampedAt} stamp:\n`);
  for (const name of Object.keys(LIBRARIES)) {
    const dir = join(ROOT, "library_repos", name);
    const stamped = stamp.libraries?.[name]?.commit;
    if (!stamped) {
      console.log(`── ${name}: not stamped — skipping`);
      continue;
    }
    try {
      git(["fetch", "origin"], dir);
    } catch {
      console.log(`── ${name}: fetch failed — log may be stale`);
    }
    let log = "";
    try {
      log = git(["log", "--oneline", `${stamped}..origin/main`], dir);
    } catch (err) {
      console.log(`── ${name}: cannot compute range (${String(err).split("\n")[0]})`);
      continue;
    }
    const count = log ? log.split("\n").length : 0;
    console.log(`── ${name} (${count} commit${count === 1 ? "" : "s"} since ${stamped.slice(0, 8)})`);
    if (log) console.log(log.replace(/^/gm, "   "));
    console.log("");
  }
}
