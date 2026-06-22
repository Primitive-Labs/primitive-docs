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
| **Factual change to documented behavior** | The change alters something a doc page or agent guide already states (a flag, a shape, a limit, an enum, a default) | Update every place that states the old fact — both human docs and agent guides. Breaking client changes (e.g. a response-envelope change) get a repo-wide sweep for the stale shape, not just the obvious page. |
| **New developer-facing capability** | A new step kind, CLI command, client API, config surface | Propose where it lands: an existing page/guide section first, by the "capabilities live on their concept's page" rule. If it's a genuinely new area with no natural home, **suggest a new page but get the user's sign-off before creating it.** |
| **Upstream parity now landed** | A JS/Swift parity fix in this batch closes a gap that forced a doc fence to stay one-language and inline (cross-ref the #126 promote-on-parity checklist) | **Promote the fence to the corpus.** Write *both* languages into `examples/<subject>/<op>.{ts,swift}` — verify the newly-available side against `SwiftEmitter.swift` / the JS client source, don't transcribe on faith — then replace the `{{#lang}}` inline fence with `{{ example: <subject>/<op> }}` so it re-enters the compile + parity gate. This is the standing mechanism that drains the one-language backlog as parity ships. |

## Step 3 — Write to the present tense

Docs describe how the platform operates **today** (on this channel: today's library main). Never write "now supports", "previously", "as of this release", or migration framing — integrate the new reality as if it had always been true (STYLE.md "No prior behavior"). If an item is a bug fix that makes the docs' existing description *true again*, often no edit is needed at all.

Verify anything you write against source per STYLE.md's source-of-truth map — PR descriptions are summaries, and summaries drift. The submodules at their new tips are the source of truth.

## Step 4 — Close the loop

1. Mirror every human-doc change into the matching agent guide template (and vice versa); `pnpm render:guides`.
2. **Restamp**: `pnpm stamp:sources` (preserves the next channel; rewrites `docs-sources.json` and `guides.json` `builtAgainst`, resetting the baseline for the next `--changes` scan). Only restamp once the docs actually reflect the new submodule tips — the restamp removes those commits from the next scan. If the pass made no doc changes, skip the restamp and reset the worktrees instead (see Step 1).
3. `pnpm check:examples` (the TS-compile and CLI gates read the built submodule source on this channel) and `npx vitepress build docs`.
4. **Close the issues this pass resolved.** For every open `primitive-docs` issue whose blocker is now in the stamped tips and whose docs change you made this pass, close it with evidence — what landed upstream, the stamped SHA, and what changed — or, if the work went through a PR, let `Fixes #NN` close it when that PR merges to its base. Do **not** close an issue whose blocker is closed upstream but not yet in the stamped tips; record it as still-deferred with the gating ref. As one-language fences graduate to the corpus, tick them off the #126 promote-on-parity checklist (and close #126 when it empties).
5. Report: a table of every scanned commit → disposition (`internal — no change` / `updated <pages>` / `promoted <fence> → corpus` / `proposed: <new section/page>` awaiting user input), plus the open issues touched (`closed #NN` / `still deferred — gated on <ref>`), plus anything the sources contradicted in the docs that you couldn't resolve.

Known channel caveat (fine to leave): the generated reference section (`pnpm gen:reference`) and the site build are only published from `main`, so reference output on next is a preview, not a published surface.
