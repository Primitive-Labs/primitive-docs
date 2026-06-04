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

## Step 6 — Land and backflow

1. PR the publish branch into `main`; merging publishes the site (publish-docs.yml verifies the channel is `production`).
2. Backflow so `next` contains everything `main` does:

   ```bash
   git checkout next && git merge main
   pnpm stamp:sources --channel next      # resolve stamp/builtAgainst conflicts back onto the next surface
   git submodule update --init            # next's pins win locally; fast-forward again on the next truing pass
   ```

   Commit and push `next`.
3. Report: release SHA published, merge point used, packages repinned, the summary-coverage table, and any held (unpublished-API) or gap items.
