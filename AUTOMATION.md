# Docs Automation — What Runs When

The current state of the automated pipeline: which workflows fire on which
triggers, which skill each one runs, on which model, and what it produces.
**Keep this file current** — any change to `.github/workflows/*` or to the
skills they invoke must be reflected here (CLAUDE.md enforces this rule).

## Agent tiers (Claude Code runs in CI)

| Workflow | Trigger / cadence | Skill | Model | Output |
|---|---|---|---|---|
| `docs-next-sync.yml` | `repository_dispatch: nightly-release` from js-bao-wss (nightly, ~11:15 UTC), or manual dispatch | `docs-next-sync` (unattended mode) | **Sonnet** | One **individual delta PR into `next`** per night (`docs-next-sync/auto-<date>-r<run>`), covering only the library window since the newest open sync PR. Opens as **draft** when the report's `SYNC_STATUS` isn't `ready`. A cheap scan gate skips the agent entirely when no library commits landed. |
| `docs-issue-sweep.yml` | Weekly schedule (Mondays 14:00 UTC), or manual dispatch | `docs-issue-sweep` (unattended mode) | **Sonnet** | One PR into `next` per actionable open issue (`issue-sweep/auto-<NN>-*`). Never merges, never closes issues; moot closures are proposed as issue comments. Skips when the tracker is empty. |
| `receive-production-release.yml` | `repository_dispatch: production-release` from js-bao-wss (each production deploy), or manual dispatch | `docs-publish-release` (unattended mode) — includes a full `docs-set-audit` **applied on the publish branch** | **Opus** | The publish branch (`publish/<date>-<sha8>`) and a PR into `main`, ready for human merge. Draft PR when `PUBLISH_STATUS: blocked`. This is the doc set's one scheduled deep pass — the nightly deliberately skips the whole-set audit. |

The unattended posture for each skill lives in that skill's **"Unattended
mode (CI)"** section (`.claude/skills/*/SKILL.md`) — the single source of
truth; workflow prompts only restate the hard boundaries. The Claude Code CLI
version is pinned in each workflow — bump deliberately. All CI jobs take their
pnpm from `package.json`'s `packageManager` field (pnpm 10; settings live in
`pnpm-workspace.yaml`), and the js-bao-wss workspace builds run under that
submodule's own pinned pnpm via corepack.

## Non-agent plumbing

| Workflow | Trigger | What it does |
|---|---|---|
| `checks.yml` | Every PR and every non-`main` push | The drift gates: example parity + compilation (TS on Linux, Swift on macOS), rendered guides current, guides.json contract, TOML validity, CLI invocations vs `primitive-admin`, docs↔guides sync-map coverage, source-stamp match. Fails loudly if a submodule pin is unreachable. |
| `publish-docs.yml` | Push to `main` | Publishes the site to gh-pages after asserting the production channel and re-running the gates. Merging to `main` **is** publishing. |
| `backmerge-main-to-next.yml` | Any PR merged into `main` (publish, hotfix, or infra), or manual dispatch | Channel-preserving back-merge that keeps `next ⊇ main`: takes `main`'s content, forces `next`'s channel/stamp/pins, runs the next-channel gates, pushes `next`. Aborts (red run) on any content conflict outside the channel/stamp/pin files — that's the signal for a human to back-merge by hand. |
| `close-issues-on-next-merge.yml` | Any PR merged into `next` | Parses `Fixes #NN` from the PR body/title and closes each referenced open issue with a back-reference (GitHub's own closing keywords only fire on default-branch merges). |

## Human-invoked skills (never scheduled)

- **`docs-pr-sweep`** — clears the open `next` PR queue: validates, fixes in
  place, merges. Sync PRs are deltas and land **oldest first** (see the
  skill's sync-PR handling). The only path that merges into `next` in bulk.
- **`docs-publish-release`** (interactive) — same skill the production tier
  runs; a human drives it when the automated publish needs taking over.
- **`docs-set-audit`** — the expensive cross-page pass. Runs automatically
  only inside the production publish; otherwise on demand (and at the end of
  a `docs-pr-sweep`).
- **`docs-page-review`, `docs-sync-check`, `docs-editorial`,
  `docs-issue-sweep` (targeted mode)** — the editorial loop for hands-on work.

## Cost posture

Nightly and weekly tiers run **Sonnet** with tightly scoped work (delta
windows, per-issue branches) — their output is gate-validated and
human-reviewed on PRs. The per-release publish tier runs **Opus** and carries
the deep whole-set audit. History: nightly passes ran ~$2–3 while scoped;
adding an every-night whole-set audit on Opus pushed them to $16–23 (Jul
2026) before this split was introduced. If a queue of unmerged sync PRs
builds up, merge it — each night's PR is a delta on the chain, and prompt
merges keep the chain shallow.
