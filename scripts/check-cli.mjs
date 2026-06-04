#!/usr/bin/env node
// Validate every documented `primitive …` invocation against the real CLI, so
// CLI examples can't drift from the commands users actually run.
//
// Which CLI depends on the docs channel (scripts/channel.mjs): the production
// channel spawns the pinned `primitive-admin` devDependency — the published
// package users install — mirroring how code examples compile against the
// published clients. The next channel spawns the CLI built from the
// library_repos/js-bao-wss submodule (`pnpm build:source-packages`), so docs
// trued against unreleased library work validate against that same work.
//
// INTERIM MECHANISM (Option A): walks the command tree by spawning
// `primitive <path…> --help` and parsing commander's Commands/Options
// sections. Once js-bao-wss#983 ships `primitive help --json`, swap the
// scraper for the manifest (tracked in a primitive-docs follow-up issue).
//
// What's validated per documented invocation:
//   • the subcommand path exists (`primitive sync push`, …)
//   • every `--flag` exists on that command (or globally)
// Positional-argument arity is NOT validated (help text is too loose).
//
// A line opts out with a `docs:nocheck` comment. Opt-outs are listed loudly.
//
// Usage:  node scripts/check-cli.mjs

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { VARIANTS } from "./variants.mjs";
import { ROOT, docsChannel, assertSourcePackagesBuilt, sourcePackageDir } from "./channel.mjs";

const CHANNEL = docsChannel();
if (CHANNEL === "next") assertSourcePackagesBuilt(["primitive-admin"]);
// [command, leading args] to spawn the channel's CLI.
const CLI =
  CHANNEL === "next"
    ? ["node", join(sourcePackageDir("primitive-admin"), "dist", "bin", "primitive.js")]
    : [join(ROOT, "node_modules", ".bin", "primitive")];

// ── Command tree, lazily discovered via --help ──────────────────────────────
const helpCache = new Map(); // "path tokens".join(" ") -> { commands: Map, flags: Set } | null

function parseHelp(text) {
  const commands = new Map(); // name -> true (descend lazily)
  const flags = new Set();
  // A "container" command takes no positionals of its own (usage ends with
  // `[options] [command]`) — a leftover bare token on one is an unknown
  // subcommand, not an argument.
  const usage = text.split("\n").find((l) => l.startsWith("Usage:")) ?? "";
  const container = /\[options\]\s+\[command\]\s*$/.test(usage);
  let section = null;
  for (const line of text.split("\n")) {
    if (/^Commands:/.test(line)) { section = "commands"; continue; }
    if (/^Options:/.test(line)) { section = "options"; continue; }
    if (/^\S/.test(line)) { section = null; continue; }
    const m = /^ {2}(\S.*)$/.exec(line);
    if (!m) continue;
    if (section === "commands") {
      const name = m[1].split(/\s/)[0];
      for (const alias of name.split("|")) commands.set(alias, true);
    } else if (section === "options") {
      // `-e, --env <name>  description` — flag tokens before the 2-space gap.
      const spec = m[1].split(/ {2,}/)[0];
      for (const f of spec.matchAll(/(?<![\w-])(--?[\w-]+)/g)) flags.add(f[1]);
    }
  }
  return { commands, flags, container };
}

function helpFor(pathTokens) {
  const key = pathTokens.join(" ");
  if (helpCache.has(key)) return helpCache.get(key);
  // `primitive <cmd> <sub> --help` prints the ROOT help at depth ≥ 2, so use
  // commander's `help` subcommand routing instead: `primitive <parents…> help <leaf>`.
  const argv =
    pathTokens.length === 0
      ? ["--help"]
      : [...pathTokens.slice(0, -1), "help", pathTokens[pathTokens.length - 1]];
  let parsed = null;
  try {
    const out = execFileSync(CLI[0], [...CLI.slice(1), ...argv], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    parsed = parseHelp(out);
  } catch {
    parsed = null; // unknown command
  }
  helpCache.set(key, parsed);
  return parsed;
}

const rootHelp = helpFor([]);
if (!rootHelp) {
  console.error(
    CHANNEL === "next"
      ? "✘ could not run the submodule-built primitive-admin CLI — run `pnpm build:source-packages`"
      : "✘ could not run the pinned primitive-admin CLI — is it installed?",
  );
  process.exit(1);
}

// ── Extract documented invocations ──────────────────────────────────────────
const renderedSuffix = new RegExp(`\\.(${VARIANTS.map((v) => v.id).join("|")})\\.md$`);
const guideFiles = readdirSync(join(ROOT, "guides", "latest"));
// Agnostic builds (`<BASE>.md` with a matching `<BASE>.template.md`) are
// rendered artifacts — scanning them would double-count their template.
const templateBases = new Set(
  guideFiles.filter((f) => f.endsWith(".template.md")).map((f) => f.replace(/\.template\.md$/, "")),
);
const sources = [
  ...guideFiles
    .filter(
      (f) =>
        f.endsWith(".md") &&
        !renderedSuffix.test(f) &&
        !(!f.endsWith(".template.md") && templateBases.has(f.replace(/\.md$/, ""))),
    )
    .map((f) => join(ROOT, "guides", "latest", f)),
  ...readdirSync(join(ROOT, "docs", "getting-started"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(ROOT, "docs", "getting-started", f)),
];

const problems = [];
const skipped = [];
let checked = 0;

// Tokenize a shell-ish line: quoted strings stay whole; strip the
// optional-syntax brackets docs use (`[--limit N]`).
function tokenize(line) {
  return [...line.matchAll(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)]
    .map((m) => m[0].replace(/^\[+/, "").replace(/\]+$/, ""))
    .filter(Boolean);
}

function checkInvocation(tokens, loc) {
  // Descend the command tree as long as tokens name subcommands. A
  // `{add|remove|list}` brace menu validates every alternative and descends
  // into the first.
  const path = [];
  let node = rootHelp;
  let i = 0;
  while (i < tokens.length) {
    const braces = /^\{(.+)\}$/.exec(tokens[i]);
    const alternatives = braces ? braces[1].split("|") : [tokens[i]];
    if (!alternatives.every((a) => node.commands.has(a))) {
      if (braces) {
        const missing = alternatives.filter((a) => !node.commands.has(a));
        problems.push(`✘ ${loc}: \`primitive ${path.join(" ")}\` has no subcommand(s): ${missing.join(", ")}`);
        return;
      }
      break;
    }
    path.push(alternatives[0]);
    i++;
    const next = helpFor(path);
    if (!next) {
      problems.push(`✘ ${loc}: \`primitive ${path.join(" ")}\` — help for subcommand failed to load`);
      return;
    }
    node = next;
  }
  if (path.length === 0) {
    // Flags-only invocations (`primitive --help`, `primitive --version`)
    // validate against the root command.
    if (!(tokens[0] ?? "").startsWith("-")) {
      problems.push(`✘ ${loc}: \`primitive ${tokens[0] ?? ""}\` is not a known command`);
      return;
    }
  }
  // A leftover bare token on a pure command container is an unknown
  // subcommand (e.g. `primitive apps origins …` when `apps` has no `origins`).
  if (node.container && i < tokens.length && !tokens[i].startsWith("-")) {
    problems.push(
      `✘ ${loc}: \`primitive ${[...path, tokens[i]].join(" ")}\` — '${tokens[i]}' is not a subcommand of \`primitive ${path.join(" ") || "(root)"}\``,
    );
    return;
  }
  // Remaining tokens: validate flags; skip positionals/placeholders.
  for (; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "--") break;
    if (!t.startsWith("-")) continue;
    const flag = t.split("=")[0];
    if (!node.flags.has(flag) && !rootHelp.flags.has(flag)) {
      problems.push(`✘ ${loc}: \`primitive ${path.join(" ")}\` has no flag \`${flag}\``);
    }
  }
  checked++;
}

const BASH_FENCE = /^```(?:bash|sh|shell)[^\n]*\n([\s\S]*?)^```[ \t]*$/gm;
for (const file of sources) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, "utf-8");
  for (const m of text.matchAll(BASH_FENCE)) {
    const blockLine = text.slice(0, m.index).split("\n").length;
    // Join `\`-continued lines before scanning.
    const lines = m[1].replace(/\\\n\s*/g, " ").split("\n");
    for (const [j, raw] of lines.entries()) {
      const line = raw.replace(/^\s*\$\s*/, "").trim();
      if (!/^primitive\s/.test(line)) continue;
      const loc = `${rel}:${blockLine + j + 1}`;
      if (/docs:nocheck/.test(raw)) { skipped.push(loc); continue; }
      // Strip a trailing comment (docs commands don't embed # in args), and
      // truncate alternatives menus (`primitive databases list | get <id> | …`)
      // at the first pipe — only the leading invocation is validated.
      const cleaned = line.replace(/\s#.*$/, "").split(/\s\|\s/)[0];
      checkInvocation(tokenize(cleaned).slice(1), loc);
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
console.log(
  `CLI invocations: ${checked} checked against primitive-admin (${CHANNEL === "next" ? "submodule source" : "published package"}, ` +
    `${helpCache.size - 1} subcommand help pages walked)` +
    (skipped.length ? `, ${skipped.length} opted out (docs:nocheck)` : ""),
);
for (const s of skipped) console.log(`  ~ skipped ${s}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("All documented CLI invocations are valid.");
