---
name: docs-publish-release
description: Publish the documentation for a platform production release by merging the next branch into main at the release SHA. Use this skill whenever given a production release summary (a "# Production release YYYY-MM-DD (sha)" document with New Features / Bug Fixes / Notes-for-users tables referencing PR and issue numbers), a production-release notification issue, or asked to "publish the docs for the release", "merge next into main", "sync the docs with the release", or "update docs for the latest release". Merging to main publishes the site — this is the only skill that should move docs from next to main.
---

# Publishing the Docs at a Production Release

`next` carries docs trued against library `main`; the production release defines which slice of that work is now live. This skill merges `next` into `main` **at the release SHA** — never past it — restamps onto the production channel, and verifies the release summary is fully covered. Day-to-day truing happens in `docs-next-sync`; by the time a release lands, the doc work should already exist on `next` and this pass is mostly mechanical.

## Step 1 — Resolve the release

From the summary header (`# Production release YYYY-MM-DD (sha8)`) take the date and the full **SHA:** field — that commit of `js-bao-wss` is what production now runs. The summary lives in the js-bao-wss repo (`releases/YYYY-MM-DD-<sha8>.md`) and is mirrored into the notification issue; the matching `deploy/production/<timestamp>` branch tip is the same SHA if you need to cross-check.

```bash
git fetch origin next && git -C library_repos/js-bao-wss fetch origin
NEXT_STAMP=$(git show origin/next:docs-sources.json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).libraries['js-bao-wss'].commit")
```

## Step 2 — Bring `next` to exactly the release SHA

Compare `NEXT_STAMP` to the release SHA (`git -C library_repos/js-bao-wss merge-base --is-ancestor A B`):

- **Stamp == release SHA** — `next` is already trued at the release. Merge point = `origin/next`. Continue.
- **Stamp behind the release SHA** (the normal case) — run a `docs-next-sync` catch-up pass on `next` first, with one change: pin the js-bao-wss submodule to **exactly the release SHA** instead of fast-forwarding to tip (`git -C library_repos/js-bao-wss checkout <RELEASE_SHA>`), so the pass triages precisely the released window and restamps at it. Merge point = the resulting `next` tip.
- **Stamp ahead of the release SHA** (overhang — `next` already documents post-release work) — don't merge the tip. Walk `next` history newest-first and pick the latest commit whose stamped js-bao-wss commit IS an ancestor of (or equal to) the release SHA:

  ```bash
  for c in $(git rev-list origin/next); do
    s=$(git show $c:docs-sources.json 2>/dev/null | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).libraries['js-bao-wss'].commit" 2>/dev/null) || continue
    git -C library_repos/js-bao-wss merge-base --is-ancestor "$s" "<RELEASE_SHA>" && { echo "$c"; break; }
  done
  ```

  Released-but-undocumented gaps this leaves (items trued in a later, mixed pass) surface in Step 5's checklist — cover them on the publish branch directly.

## Step 3 — Merge into main

```bash
git checkout main && git pull && git checkout -b publish/<YYYY-MM-DD>-<sha8>
git merge <merge-point>                                   # brings docs + submodule pins + stamp from next
git -C library_repos/js-bao-wss checkout <RELEASE_SHA>    # pin exactly at the release
```

Other submodules keep the merge point's pins — they were trued together with these docs; their published surface is governed by the npm-version check below, not by this release's SHA.

## Step 4 — Repin packages and restamp onto production

The production channel's gates run against the **published** packages, so align the pins with what the release actually published (a platform deploy does not always include an npm publish):

1. `npm view <pkg> version` for `js-bao-wss-client`, `js-bao`, `primitive-admin`, `primitive-app`; bump any pinned devDependency in `package.json` that has a newer published version, then `pnpm install`.
2. `pnpm stamp:sources --channel production` — flips the channel back and rewrites `docs-sources.json` + `guides.json` `builtAgainst` from the production surface.
3. `pnpm check:examples` and `npx vitepress build docs`.

If a gate fails because a doc relies on a merged-but-unpublished package API (the release shipped the platform but not the package), that slice is **not publishable yet**: revert those doc changes on the publish branch (they remain on `next`), record the held items in the report, and continue. The gates — not a hand-maintained list — are the arbiter of what main can state.

## Step 5 — Verify the release summary is covered

Walk every row of every summary table (New Features, Bug Fixes, Cleanup, Performance, Dependencies, Model Changes, Notes for users) and confirm its disposition in what's being published: documented (where?), or internal/not developer-facing (why?). This should be a checklist pass — the writing happened on `next`. Any gap is a missed `docs-next-sync` triage: fix it now on the publish branch using that skill's triage classes and STYLE.md rules, and note the miss so the next-sync cadence can improve.

## Step 6 — Run the full set audit (required)

Coverage (Step 5) only confirms the released window is *documented*; it can't see cross-page problems that accumulate as many `docs-next-sync` and PR-sweep passes land between releases — the same fact stated two ways, a concept taught twice, a dead anchor that only breaks on the merged tip, an orphaned page. Every production push runs a full **docs-set-audit** over the publish branch — the exact tree about to become `main`:

```bash
git checkout publish/<YYYY-MM-DD>-<sha8>   # audit what's about to publish, not next's tip
```

Run **docs-set-audit** end to end: its mechanical sweeps (orphans, build + anchors, example-parity inventory, structure mirror, manifest integrity) and its cross-page judgment passes (duplication, inconsistency, boundary, set-level ramp).

- **Outright breakage is this skill's to fix before landing** — a dead link, a stamp/parity failure, two pages that now contradict each other. Fix it on the publish branch, then re-run `pnpm check:examples` and `npx vitepress build docs`.
- **Cross-page restructures are proposals**, per docs-set-audit. Don't block the release on optional consolidations: surface them in the report and leave them for a follow-up `next` pass unless they're outright breakage. Anything fixed here must also flow back to `next` (Step 8's back-merge carries it).

Fold the audit result into the report (clean bill, or the findings and which were fixed vs. deferred).

## Step 7 — Summarize the docs delta

The publish PR carries a standalone summary of what the documentation now covers that it didn't at the last published release. **Audience: platform developers** — people who build Primitive, not external users and not docs-repo maintainers. The summary must stand on its own: no mention of branches, truing passes, channels, stamps, or any other publishing mechanics. Write "X is now documented" / "examples for Y now compile on both platforms", never "merged from next" or "trued against main".

The window is the publish branch against the pre-publish `main`:

```bash
git log --first-parent --oneline origin/main..HEAD
git diff --stat origin/main..HEAD -- docs/ guides/ examples/ scripts/ .github/
```

Read the underlying commits (and their diffs where the subject isn't enough), then write release-notes-altitude bullets **grouped by platform area** (Workflows, Databases, CLI & configuration, platform/language examples, Getting started, Reference…), not by docs product — a fact documented on a page, in a guide, and in an example is *one* bullet naming where it landed. Close with a **Documentation tooling** group for changes to how the docs are validated or built (new gates, validators, CI checks) — described by what they guarantee ("documented CLI invocations are validated against the CLI's manifest"), not by script names. Include parity bugs filed in lieu of documenting gaps.

Skip mechanical noise entirely: source stamps, lockfiles, rendered guide builds, skill/process edits, regenerated reference pages (mention the regeneration once if its *content* changed meaningfully).

## Step 8 — Land and backflow

1. PR the publish branch into `main` with the release-coverage table (Step 5), the set-audit result (Step 6), **and** the docs-delta summary (Step 7); merging publishes the site (publish-docs.yml verifies the channel is `production`).
2. Backflow so `next` contains everything `main` does. **`next` is never recreated from `main`** — it carries trued-but-unreleased work a reset would destroy; you *merge* `main` into it. This release-time back-merge is the primary mechanism that keeps `next ⊇ main` (an interactive `docs-next-sync` run can optionally drain sooner, but the unattended nightly never does — it only opens PRs).

   **CI normally does this for you.** `backmerge-main-to-next.yml` fires when the publish PR (head `publish/**`) merges into `main` — whether you opened it or the automated publisher did — and performs this back-merge channel-preservingly: it takes `main`'s new content but forces `next`'s channel/stamp/pins, runs the next gates, and pushes `next` directly. So after the publish PR merges, **check that workflow succeeded** rather than running anything by hand.

   Only run the back-merge manually if that workflow **failed or aborted** (it aborts and goes red on a content conflict outside the channel/stamp/pin files — exactly the case a human must resolve):

   ```bash
   git checkout next && git merge main
   pnpm stamp:sources --channel next      # resolve stamp/builtAgainst conflicts back onto the next surface
   git submodule update --init            # next's pins win locally; fast-forward again on the next truing pass
   ```

   Commit and push `next`.
3. Report: release SHA published, merge point used, packages repinned, the summary-coverage table, the set-audit result, the docs-delta summary, and any held (unpublished-API) or gap items.
