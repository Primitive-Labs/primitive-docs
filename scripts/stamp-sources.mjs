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
//   node scripts/stamp-sources.mjs            # (re)write the stamp from current state
//   node scripts/stamp-sources.mjs --check    # CI gate: stamp matches submodule HEADs
//                                             # + installed versions + guides.json
//   node scripts/stamp-sources.mjs --changes  # per-library `git log <stamped>..origin/main`
//                                             # to scan for doc-impacting changes
//
// npm versions come from the INSTALLED pinned packages (what compile/CLI gates
// actually ran against), or the submodule's own package.json for packages not
// installed here — never from the registry, so --check stays deterministic.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STAMP_PATH = join(ROOT, "docs-sources.json");
const GUIDES_JSON = join(ROOT, "guides", "latest", "guides.json");
const MODE = process.argv.includes("--check")
  ? "check"
  : process.argv.includes("--changes")
    ? "changes"
    : "write";

// Library repo → the npm packages that represent it in the docs' validation
// gates. "installed" = read from this repo's node_modules (pinned devDep);
// a path = read that package.json inside the submodule.
const LIBRARIES = {
  "js-bao-wss": {
    packages: { "js-bao-wss-client": "installed", "js-bao": "installed", "primitive-admin": "installed" },
  },
  "primitive-app-dev": {
    packages: { "primitive-app": "primitive-app/package.json" },
  },
  "swift-primitive-app-dev": { packages: {} }, // Swift package — commit only
};

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function currentState() {
  const libraries = {};
  for (const [name, cfg] of Object.entries(LIBRARIES)) {
    const dir = join(ROOT, "library_repos", name);
    const commit = git(["rev-parse", "HEAD"], dir);
    const npm = {};
    for (const [pkg, source] of Object.entries(cfg.packages)) {
      const pkgJson =
        source === "installed" ? join(ROOT, "node_modules", pkg, "package.json") : join(dir, source);
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
  const libraries = currentState();
  const stamp = { stampedAt: new Date().toISOString().slice(0, 10), libraries };
  writeFileSync(STAMP_PATH, JSON.stringify(stamp, null, 2) + "\n");

  // Mirror published versions (no commits) into the guides manifest.
  const manifest = readJson(GUIDES_JSON);
  const out = {
    defaults: manifest.defaults,
    builtAgainst: { stampedAt: stamp.stampedAt, packages: mergedPackages(libraries) },
    guides: manifest.guides,
  };
  writeFileSync(GUIDES_JSON, JSON.stringify(out, null, 2) + "\n");
  console.log(`Stamped ${Object.keys(libraries).length} libraries (${stamp.stampedAt}) → docs-sources.json + guides.json builtAgainst.`);
}

// ── check ────────────────────────────────────────────────────────────────────
if (MODE === "check") {
  const problems = [];
  if (!existsSync(STAMP_PATH)) {
    problems.push("✘ docs-sources.json missing — run `pnpm stamp:sources`");
  } else {
    const stamp = readJson(STAMP_PATH);
    const now = currentState();
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
    const expected = { stampedAt: stamp.stampedAt, packages: mergedPackages(now) };
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
