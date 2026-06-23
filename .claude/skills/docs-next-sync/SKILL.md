---
name: docs-next-sync
description: True the documentation on the next branch against the library main tips. Use this skill whenever asked to "run docs next sync", "sync the docs with the libraries", "what changed since the last doc update", "update docs for the latest library changes", or when a submodule-update notification arrives from a library repo. Scans every library commit since the last truing pass, triages developer relevance, and updates affected pages and guides on the next channel. (Publishing those docs to main happens at a production release via docs-publish-release — not here.)
---

# Truing the Docs Against Library Main (`next` channel)

The `next` branch tracks the library `main` tips: everything merged in a library repo is documentable here immediately, whether or not it has shipped in a production release. Publishing is a separate, release-driven event (`docs-publish-release`). Read `STYLE.md` first — especially "No prior behavior" and "Facts and verification".

## Step 0 — Branch and channel discipline

This skill operates on `next` (or a working branch that PRs into `next`) — never on `main`:

```bash
git branch --show-current                 # next, or a branch off next
node -p "require('./docs-sources.json').channel"   # must print "next"
```

If the channel prints `production`, you are not on the next line — stop and check out `next`. (The one exception: bootstrapping `next` itself, where you flip the channel with `pnpm stamp:sources --channel next`.)

## Step 0.5 — Drain `main` into `next` (interactive convenience)

This step is a **direct push to `next`**, so it only applies when a human is driving the skill interactively. You don't need to detect your own run mode: the unattended CI action's rules forbid `git merge`/`commit`/`push` outright (it only ever *opens a PR*), which already precludes this step — if your run instructions told you you're unattended in CI, you are not doing this. Branch convergence for the automated path is handled at release time by `docs-publish-release`'s back-merge (`main` → `next`); the nightly stays strictly PR-only. Run this step only when you're working interactively and want to pull `main`'s between-release infra forward sooner.

`next` is long-lived and never recreated from `main` — it carries trued-but-unreleased doc work that a reset would destroy. The intended invariant is `next ⊇ main`, and `docs-publish-release` re-establishes it at each release. But infra lands on `main` between releases — CI, skills, `CLAUDE.md`, `.gitignore` arrive via PRs to the default branch. If you're running interactively and notice `main` is ahead, drain it before truing so the pass builds on current infra:

```bash
git fetch origin main
git cherry origin/next origin/main        # patch-id check: '+' = on main, not yet on next
```

If `git cherry` shows `+` commits, bring `main` forward into `next` with the same channel-preserving recipe `docs-publish-release` uses — so the merge takes `main`'s infra but never its production channel/pins:

```bash
git merge --no-ff origin/main             # brings main's commits onto next
pnpm stamp:sources --channel next         # re-assert the next channel over any production stamp the merge pulled
git submodule update --init               # next's pins win locally (truing below fast-forwards them again)
```

Resolve any conflict on `docs-sources.json` / `library_repos/*` / `guides/latest/guides.json` to **next's** side (the stamp/submodule restore above does this); take `main`'s side for pure infra (`.github/`, `.claude/`, `CLAUDE.md`). If the only `+` commits are ones `next` already contains in fuller form (a superseded skill edit), it's fine to skip them — confirm with the diff, don't merge a regression. Commit the drain before moving on; report the merge point. (Pure-infra commits can also just be cherry-picked onto `next` — that avoids touching channel/pin state entirely.)

## Step 1 — Inventory and open the sources

Scan first — it reads each library's stamped-commit→`origin/main` diff and is the honest baseline — then fast-forward the submodules so every source check in this pass reads the tip:

```bash
node scripts/stamp-sources.mjs --changes   # per-library commits since the last truing pass
pnpm submodules:update                     # fast-forward library_repos/* to their branch tips
pnpm build:source-packages                 # rebuild js-bao / js-bao-wss-client / primitive-admin from source
```

Moving the submodules intentionally breaks the stamp gate until Step 4 restamps. If the pass ends with **no** doc changes (everything internal), don't restamp — reset the worktrees instead with `git submodule update --init` so the gate stays green and the baseline keeps resurfacing the unreviewed commits.

The scan IS the inventory: triage every listed commit through Step 2 (commit subjects carry the PR number — `gh pr view <num> --repo Primitive-Labs/<repo>` for the description, `gh pr diff <num> --name-only` for the surface it touched: `cli/` → CLI docs, `src/client/` → client API docs, `src/app-api/` → behavior/limits, `web-admin/` → admin console page, `models.yaml` → usually internal). If the scan shows zero commits in every library, report "docs already current as of <stampedAt>" and stop. For large batches, fan the per-item investigation out to parallel subagents and collect structured verdicts.

**Also scan the open issue tracker** — many open `primitive-docs` issues are *upstream-keyed*: "re-true X when js-bao-wss#NNN merges", or the parity-promotion tracker (#126, which lists one-language doc fences awaiting JS/Swift parity). The library commits in this batch are exactly what unblocks them.

```bash
gh issue list --state open --limit 100 --json number,title,body
```

For each open issue that names a library issue/PR as its blocker, check whether that blocker is actually in the **new submodule tips you just fast-forwarded to** — not merely closed upstream. A blocker that is closed on library main but not yet in your stamped tips is still deferred this pass; one that is now in-tree flips its docs issue from blocked → actionable. Fold an actionable issue's notes into the change you make for its corresponding library commit (the issue often records exactly what to say and where), and line it up for closing in Step 4.

On this channel there is **no published-vs-merged distinction**: merged to library main means documentable. The gates validate against the same source (`pnpm build:source-packages` builds it), so a doc for an unreleased CLI flag or client API passes here and is held back from `main` automatically until release time.

## Step 2 — Triage every item

Classify each item before touching any doc:

| Class | Test | Action |
|---|---|---|
| **Not developer-facing** | Infra, internal refactors, admin/pipeline tooling, skills, CI, deploy plumbing, model/GSI changes with no API impact | **No doc change.** Record the item + "internal" in your report — silence must be a decision, not an oversight. |
| **Factual change to documented behavior** | The change alters something a doc page or agent guide already states (a flag, a shape, a limit, an enum, a default) | Update every place that states the old fact — both human docs and agent guides. Breaking client changes (e.g. a response-envelope change) get a repo-wide sweep for the stale shape, not just the obvious page. **A method-signature change (sync→`async`, a newly-added `throws`, a renamed/removed parameter) ripples to every example that calls it — and the compile gate in Step 4 enumerates those callsites for free.** Don't hand-pick the examples you remember; change the obvious ones, then let `pnpm check:examples` surface the rest and fix each until it's green (see Step 4). The same applies to the prose: a blanket claim stated once per guide ("reads are synchronous") can contradict the new signature in a spot the diff never touched — grep the set for the old fact, not just the page you edited. |
| **New developer-facing capability** | A new step kind, CLI command, client API, config surface | **Draft the documentation — don't just flag it.** Default hard to landing it in an **existing page/guide section** ("capabilities live on their concept's page"): find the closest concept and write it there, reshaping the section if needed. Only add a **new page** when the topic genuinely won't sit on any existing page without distorting it — and even then, *write the page* (sidebar entry included), don't park it as a question. Anything larger than a routine section edit — a new page, a big restructure, a content removal — still gets **drafted on the PR**, then **called out prominently in the report as a larger change needing review** (placement / IA / scope). A drafted page a human can read and adjust beats an issue that describes one; the PR is the review surface. |
| **Capability lands in one language only** | A new client API exists for JS or Swift but not the other (a Swift-client method with no JS counterpart, or vice versa) | Document it scoped to that language's `{{#lang}}` block per STYLE.md (the other build simply doesn't mention it — no "not available", no gap aside) **and file the parity gap as an issue** so the platform can close it. **File it even in an unattended run** — per `.claude/ISSUE_FILING.md` (which repo, the `ios` label for Swift-client gaps, no assignee unless told). Record the filed issue number in the report; don't merely "describe the gap" in the report and move on. |
| **Upstream parity now landed** | A JS/Swift parity fix in this batch closes a gap that forced a doc fence to stay one-language and inline (cross-ref the #126 promote-on-parity checklist) | **Promote the fence to the corpus.** Write *both* languages into `examples/<subject>/<op>.{ts,swift}` — verify the newly-available side against `SwiftEmitter.swift` / the JS client source, don't transcribe on faith — then replace the `{{#lang}}` inline fence with `{{ example: <subject>/<op> }}` so it re-enters the compile + parity gate. This is the standing mechanism that drains the one-language backlog as parity ships. |

## Step 3 — Write to the present tense

Docs describe how the platform operates **today** (on this channel: today's library main). Never write "now supports", "previously", "as of this release", or migration framing — integrate the new reality as if it had always been true (STYLE.md "No prior behavior"). If an item is a bug fix that makes the docs' existing description *true again*, often no edit is needed at all.

Verify anything you write against source per STYLE.md's source-of-truth map — PR descriptions are summaries, and summaries drift. The submodules at their new tips are the source of truth.

## Step 4 — Close the loop

1. Mirror every human-doc change into the matching agent guide template (and vice versa); `pnpm render:guides`.
2. **Restamp**: `pnpm stamp:sources` (preserves the next channel; rewrites `docs-sources.json` and `guides.json` `builtAgainst`, resetting the baseline for the next `--changes` scan). Only restamp once the docs actually reflect the new submodule tips — the restamp removes those commits from the next scan. If the pass made no doc changes, skip the restamp and reset the worktrees instead (see Step 1).
3. **Run `pnpm check:examples` and drive it to green — this is a hard, blocking gate, not a checkbox.** On this channel its TS-compile and Swift-compile steps build the *entire* corpus against the new submodule source, so any signature change you trued (Step 2's factual-change row) fails compilation at every stale callsite — including examples your diff never touched and `nocompile` glue that still has to be correct. Read each failure, fix that example (in **both** languages — parity), `pnpm render:guides` if a fixed example feeds a guide template, and re-run until the gate passes clean. Then `npx vitepress build docs` for dead links. **Never open the PR (and never report "Gates ✅") on a gate you didn't actually run to a green result** — a red or unrun compile gate is the single most common way a truing PR ships broken, and it is exactly what this gate exists to prevent. If you are running unattended and a failure has no mechanical fix, leave the PR unopened (or as a draft) and surface the failure in the report rather than claiming a pass.
4. **Close the issues this pass resolved.** For every open `primitive-docs` issue whose blocker is now in the stamped tips and whose docs change you made this pass, close it with evidence — what landed upstream, the stamped SHA, and what changed — or, if the work went through a PR, let `Fixes #NN` close it when that PR merges to its base. Do **not** close an issue whose blocker is closed upstream but not yet in the stamped tips; record it as still-deferred with the gating ref. As one-language fences graduate to the corpus, tick them off the #126 promote-on-parity checklist (and close #126 when it empties).
5. **Whole-set audit — always run.** Run `docs-set-audit` on every pass on this channel, including all-internal passes: it's a once-daily nightly cadence (the right interval for the expensive cross-page pass that's too costly per-edit), so it doubles as a standing daily health check, and the accumulation of small per-item edits against a set is exactly the drift it catches (a fact updated on one page but not its duplicate, a new capability landed on a collaborator's page). Its mechanical sweeps overlap the gates you just ran (`check:examples`, the site build) — lean on its cross-page judgment passes (duplication, inconsistency, boundary). **Apply the findings as edits, including cross-page restructures** — this overrides `docs-set-audit`'s standalone "surface as proposals" rule: the next pass writes to a working branch that PRs into `next`, so the PR is the review surface for a moved section or split page, not a parked proposal. Re-run the gates after the audit's edits.
6. Report: a table of every scanned commit → disposition (`internal — no change` / `updated <pages>` / `promoted <fence> → corpus` / `drafted <new section/page/removal> — larger change, flagged for review`), plus the issues touched (`closed #NN`, `filed <repo>#NN` for parity gaps, `still deferred — gated on <ref>`), plus the whole-set audit's findings and the fixes applied, plus anything the sources contradicted in the docs that you couldn't resolve. The report **flags** the larger drafted changes for a reviewer's attention — it never withholds the change itself: by the end of an unattended run, new capabilities are *drafted on the PR* (not parked as questions) and parity gaps are *filed as issues* (not just described here).

Known channel caveat (fine to leave): the generated reference section (`pnpm gen:reference`) and the site build are only published from `main`, so reference output on next is a preview, not a published surface.
