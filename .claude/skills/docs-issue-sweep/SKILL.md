---
name: docs-issue-sweep
description: Sweep the primitive-docs GitHub issue tracker for documentation improvements and implement them through the editorial pipeline. Use this skill whenever asked to "sweep the doc issues", "work through the docs backlog", "scan issues for doc improvements", "implement the open doc issues", "fix issue #NN" (for an issue in this repo), or any request to triage, batch-process, or implement fixes from this repo's issue tracker. Triages every open issue, presents a plan, then implements each accepted issue on its own branch and PRs it into next with full validation (editorial standards, page review, sync check, check:examples, vitepress build).
---

# Sweeping the Docs Issue Tracker

Open issues in `Primitive-Labs/primitive-docs` are doc-improvement requests: factual errors found in guides, missing coverage, examples that contradict the runtime, and occasionally repo-tooling changes (validation scripts, gates). This skill turns that backlog into reviewed PRs against `next`.

Two modes, same pipeline:
- **Sweep** (default): triage every open issue, present a plan, implement the accepted set.
- **Targeted**: the user names specific issue(s) ("fix #84") — skip the full scan, but still verify and report per issue exactly as below.

## Step 0 — Branch and channel discipline

All work lands on `next` — **never `main`** — unless the user explicitly directs otherwise (publishing to main is `docs-publish-release`'s job, and hotfixes to published docs are a user call, not a sweep default):

```bash
git checkout next && git pull
node -p "require('./docs-sources.json').channel"   # must print "next"
pnpm build:source-packages                          # gates on this channel read built submodule source
```

Do **not** move the submodules (`pnpm submodules:update`) — that is `docs-next-sync`'s job and breaks the source-stamp gate. This skill fixes docs against the sources as currently stamped.

## Step 1 — Scan and triage

```bash
gh issue list --state open --limit 100 --json number,title,labels,body
```

Read every issue body in full (`gh issue view <n>`) — they are usually precise, structured reports with a Background/Ask shape and cross-repo references. Classify each:

| Class | Test | Action |
|---|---|---|
| **Doc-content fix** | The ask is to change `docs/`, guide templates, or the examples corpus | Implement (Step 3). |
| **Repo-tooling fix** | The ask is to change `scripts/`, gates, or `guides.json` machinery | Implement (Step 3) — same branch/PR discipline; validation still must pass end to end. |
| **Upstream-blocked** | The ask is conditional on library work ("when js-bao-wss#NNN lands") | Check whether the blocker actually landed (`gh pr view <n> --repo Primitive-Labs/<repo>`, and confirm the change is in the *stamped* submodule SHA — landed on library main but not yet synced means it is still blocked for this pass). Landed → implement; not landed → skip with the blocker noted. |
| **Moot** | Verification (Step 2) shows the reported problem no longer exists, or the docs already say the right thing | Propose closing with evidence; close only after the user's go-ahead. |
| **Needs user input** | Scope is ambiguous, asks for a judgment call (new page, structural change), or contradicts STYLE.md | Surface the question in the triage report; don't guess. |

**Present the triage report before implementing anything**: a table of issue → class → planned change (specific pages/templates/scripts) or skip reason. Flag issues that touch the same pages — they may want a sequencing note or, with the user's sign-off, a combined PR. Wait for the go-ahead.

## Step 2 — Verify before fixing

Issues are written at a point in time; the libraries and the docs both move. Before implementing, re-verify the issue's factual claim against the current submodule source (STYLE.md's source-of-truth map) and the current state of the docs:

- If the claim no longer holds, the issue is moot — don't "fix" docs into a wrong state on the issue's authority.
- If the claim holds but the issue's *proposed* fix is stale or conflicts with STYLE.md, implement what's actually correct and say so in the PR.
- If the fix would document a one-platform capability or expose a JS/Swift gap, follow STYLE.md's platform treatment and file the parity bug in the library repo where the fix lives.

## Step 3 — Implement, one branch per issue

For each accepted issue:

```bash
git checkout next && git checkout -b issue-<NN>-<short-slug>
```

Follow the **docs-editorial** skill for all writing. The mechanics that trip up issue fixes specifically:

- Examples live in the corpus (`examples/<subject>/<op>.{ts,swift}`) — fix both languages, never an inline fence in one doc.
- Agent guides are built artifacts: edit the `.template.md` + corpus, run `pnpm render:guides`. Never touch `.ts.md`/`.swift.md` builds directly.
- The guide sync rule cuts both ways: an issue reported against a guide usually has a sibling statement in `docs/` (and vice versa) — fix every place that states the wrong fact, not just the one the issue cites.
- Write to the present tense: no "previously", no "fixed", no changelog framing in the docs themselves.

## Step 4 — Validate and review

Per branch, before opening the PR:

```bash
pnpm check:examples        # parity, compilation, TOML, guide render/registry, CLI, stamp gate
npx vitepress build docs   # dead links fail the build
```

Then run **docs-page-review** on each touched page/guide and **docs-sync-check** across the docs↔guides pair. Fix what they surface; gates passing is necessary, not sufficient.

## Step 5 — PR and close the loop

One PR per issue, into `next`:

```bash
gh pr create --base next --title "<imperative summary> (#<NN>)" --body "...

Fixes #<NN>"
```

The PR body states: what the issue reported, what was verified against source, what changed (pages/templates/corpus), and the validation results. `Fixes #NN` auto-closes the issue on merge — don't close issues manually for implemented fixes.

Final report, covering **every** issue scanned (silence must be a decision, not an oversight):

| Issue | Disposition |
|---|---|
| #NN | PR #MM opened |
| #NN | skipped — blocked on js-bao-wss#NNN (not yet in stamped submodule) |
| #NN | moot — closed with evidence (after go-ahead) |
| #NN | needs input — <question> |
