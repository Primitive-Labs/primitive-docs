---
name: docs-pr-sweep
description: Sweep every open pull request targeting the next branch — validate each against the repo's editorial standards and validation gates, fix failures in place, merge the passing set into next, then run a whole-set audit over next. Use this skill whenever asked to "sweep the open PRs", "review and merge the doc PRs", "validate the open PRs", "clear the PR queue", "merge the open pull requests", "process the PR backlog", or any request to batch-review, triage, or land the open pull requests in primitive-docs. This skill only ever merges into next — publishing to main is docs-publish-release's job, never this one.
---

# Sweeping the Open PRs into `next`

Open pull requests based on `next` are doc work awaiting review and merge: fixes from `docs-issue-sweep`, truing changes from `docs-next-sync`, one-off edits. This skill takes that queue to zero — validating each PR against the same standards we'd apply to fresh writing, fixing what's fixable on the PR's own branch, merging the passing set into `next`, and then revalidating the whole documentation set with `docs-set-audit`. The end state: every open `next`-targeted PR is correct, editorially consistent, and merged, and the full set is re-audited.

The non-negotiable boundary: **this skill never merges to `main`.** Merging to `main` publishes the site and is `docs-publish-release`'s sole responsibility. PRs based on `main` (hotfixes) are out of scope here — list them in the report and leave them untouched.

## Step 0 — Scope and channel discipline

Work the `next` queue only:

```bash
git checkout next && git pull
node -p "require('./docs-sources.json').channel"   # must print "next"
pnpm build:source-packages                          # next-channel gates read built submodule source
```

Do **not** move the submodules (`pnpm submodules:update`) — that is `docs-next-sync`'s job and breaks the source-stamp gate. This skill validates each PR against the sources as currently stamped.

## Step 1 — Enumerate the queue

```bash
gh pr list --base next --state open --json number,title,headRefName,author,isDraft,mergeable,files
```

Skip drafts unless the user names them. For any PR whose `headRefName` lives in a fork (push access not guaranteed), note it — the fix-in-place step in Step 3 can't push there, so it falls back to comment-and-hold. Flag PRs that touch the **same files** as each other up front: they will conflict on merge, so they need an order (Step 4).

Also surface — but do not act on — any open PRs with `--base main`; they belong to `docs-publish-release`.

## Step 2 — Validate each PR

Fan out one reviewer per PR (parallel subagents work well; each checks out the PR branch in isolation and returns a structured verdict). For each PR:

```bash
gh pr checkout <NN>
```

Then run the full review the same way we gate fresh writing — passing gates is necessary, not sufficient:

1. **Correctness against source.** Re-verify every factual claim the PR makes (limits, enums, defaults, API shapes, CLI flags) against the current submodule source per STYLE.md's source-of-truth map. A PR can be internally clean and still document a wrong fact; don't merge a confident-but-wrong change on the PR's authority.
2. **Editorial review.** Apply **docs-page-review** to each touched page and guide, against the **docs-editorial** standards and STYLE.md — altitude, tone, never-say rules, platform treatment, the no-platform-gap and no-legacy-framing rules.
3. **Docs↔guides sync.** Run **docs-sync-check** across the pair. A change to `docs/` that didn't update the sibling guide (or vice versa) is incomplete, not mergeable.
4. **Mechanical gates.**

   ```bash
   pnpm check:examples        # parity, compilation, TOML, guide render/registry, CLI, stamp gate
   npx vitepress build docs   # dead links fail the build
   ```

Each reviewer returns one of three verdicts, with the specific findings (file, line, the rule or fact at issue) and — for guide builds — confirmation the PR edited the `.template.md` + corpus rather than a rendered `.ts.md`/`.swift.md` artifact:

- **green** — passes every count; nothing to do but merge.
- **mechanical-fix** — a slip with one correct resolution (an editorial nit, a stale fact, a missed sync sibling, a parity/build failure). No human input needed.
- **needs-judgment** — a finding with no single obvious fix: a structural/scope question, a STYLE.md conflict, a one-platform capability that may need a parity bug filed instead of documenting, an ambiguous factual claim source can't settle. Capture it as a precise, answerable **question** plus the options you see.

The goal of this skill is an empty `next` queue, so `needs-judgment` is **not** a terminal state — it is a question to get answered (Step 3), not a reason to leave a PR unmerged.

## Step 3 — Resolve judgment calls, then fix in place

Work every PR to merge-ready. Two kinds of work get it there:

**Get the judgment questions answered.** Collect the `needs-judgment` questions from across the whole validation pass and surface them to the user **together** (one consolidated round via AskUserQuestion where the choices are discrete — fewer interruptions than asking per-PR), each question naming the PR, the finding, and the options. Don't guess and don't defer: a PR can't merge until its question is resolved, and resolving it is this skill's job. If an answer needs more back-and-forth, keep at it until the disposition is settled. The user's answer *is* the fix's spec.

**Apply the fix on the PR's own branch**, following **docs-editorial** — for both mechanical fixes and the now-decided judgment calls:

- Examples live in the corpus (`examples/<subject>/<op>.{ts,swift}`) — fix both languages, never an inline fence in one doc.
- Guide edits go through the `.template.md` + `pnpm render:guides`; never hand-edit a rendered build.
- The sync rule cuts both ways — if a fact is wrong, fix every place that states it, not just the one the reviewer flagged.
- A decision to file a parity bug rather than document a gap means *doing both*: scope the prose to the one language's block per STYLE.md **and** file the bug in the library repo where the fix lives.
- Write present-tense: no "previously", no changelog framing in the docs themselves.

Re-run Step 2's gates, then push to the PR branch:

```bash
git push                       # to the PR's head branch
```

The one situation this skill can't drive to merge by itself is a PR from a **fork branch without maintainer-edit access** — you physically can't push the fix there. First try (`gh pr checkout` keeps the remote; a push fails loudly if access is missing). If it's genuinely unpushable, post the exact findings (and any resolved judgment answer) as a PR review so the author can apply them, and flag it in the report as the lone exception — every other PR should finish merged.

## Step 4 — Merge the passing set into `next`

Once a PR is green on every count in Step 2 (after any Step 3 fixes), merge it — no approval checkpoint is needed for landing on `next`. Before each merge, **assert the base** so this skill can never publish:

```bash
test "$(gh pr view <NN> --json baseRefName -q .baseRefName)" = "next" || { echo "REFUSING: base is not next"; exit 1; }
gh pr merge <NN> --squash --delete-branch
```

Merge the flagged same-file PRs **one at a time**, newest-validated first or in whatever order minimizes rework; after each merge, rebase the next conflicting PR on the updated `next` and re-run its Step 2 gates before merging it — a clean validation against a stale base isn't a clean merge. Keep `next` green at every step: the source-stamp gate must still pass after each merge (PRs into `next` shouldn't move submodules; if one did, that's a `docs-next-sync` concern — hold it).

## Step 5 — Revalidate the whole set

Merging several PRs can create cross-page problems no single-PR review can see — the same fact now stated two ways across two just-merged PRs, a concept newly taught twice, a link that resolved per-branch but not on the merged tip. Pull the updated branch and run the expensive cross-page pass:

```bash
git checkout next && git pull
```

Then run **docs-set-audit** over `next` — duplication, inconsistency, boundary violations, orphans, set-wide parity. Cross-page restructures it surfaces are *proposals* for the user (as that skill specifies), but any outright breakage introduced by the merges (a dead link, a stamp/parity failure, two merged PRs now contradicting each other) is this sweep's to fix before declaring done.

## Reporting

Final report covering **every** open PR enumerated in Step 1 — silence must be a decision, not an oversight. By design every `next`-targeted PR should end **merged**; anything that didn't is the exception and needs its reason:

| PR | Disposition |
|---|---|
| #NN | merged into next |
| #NN | fixed in place (editorial: <what>), merged into next |
| #NN | judgment call resolved (<question → your answer>), fixed, merged into next |
| #NN | NOT merged — fork branch without push access; findings posted for the author |
| #NN | skipped — based on main (docs-publish-release's domain) |

Close with the `docs-set-audit` result: clean bill, or the cross-page findings and which were fixed vs. proposed to the user.
