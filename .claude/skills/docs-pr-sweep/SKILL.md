---
name: docs-pr-sweep
description: Sweep every open pull request targeting the next branch — validate each against the repo's editorial standards and validation gates, fix failures in place, merge the passing set into next, then run a whole-set audit over next. This includes the automated docs-next-sync PRs (the submodule-moving truing PRs): review and merge them in concert with the rest of the queue. Use this skill whenever asked to "sweep the open PRs", "review and merge the doc PRs", "validate the open PRs", "clear the PR queue", "merge the open pull requests", "process the PR backlog", or any request to batch-review, triage, or land the open pull requests in primitive-docs. This skill only ever merges into next — never to main, not even for an automated production push; publishing to main is docs-publish-release's job.
---

# Sweeping the Open PRs into `next`

Open pull requests based on `next` are doc work awaiting review and merge: fixes from `docs-issue-sweep`, truing changes from `docs-next-sync`, one-off edits. This skill takes that queue to zero — validating each PR against the same standards we'd apply to fresh writing, fixing what's fixable on the PR's own branch, merging the passing set into `next`, and then revalidating the whole documentation set with `docs-set-audit`. The end state: every open `next`-targeted PR is correct, editorially consistent, and merged, and the full set is re-audited.

**The automated `docs-next-sync` PRs are in scope.** These are the truing PRs the `docs-next-sync` workflow opens automatically — titled `docs-next-sync: <library> changes (automated)`, they move a submodule pointer in `library_repos/`, re-stamp `docs-sources.json`, and update the affected pages/guides. Earlier versions of this skill held them; that was wrong. Review them in concert with the rest of the queue and merge them into `next` like any other PR (they get extra handling in Step 2 because they move submodules — see "Handling `docs-next-sync` PRs"). They merge into `next` only — never to `main`.

The non-negotiable boundary: **this skill never merges to `main`.** Merging to `main` publishes the site and is `docs-publish-release`'s sole responsibility — even an automated production-push PR is out of scope here. PRs based on `main` (hotfixes, production pushes) are never touched: list them in the report and leave them be.

## Step 0 — Scope and channel discipline

Work the `next` queue only:

```bash
git checkout next && git pull
node -p "require('./docs-sources.json').channel"   # must print "next"
pnpm build:source-packages                          # next-channel gates read built submodule source
```

Do **not** globally bump the submodules to library `main` (`pnpm submodules:update`) — chasing the live tips is `docs-next-sync`'s job and would break the source-stamp gate. Validate ordinary PRs against the sources as currently stamped. The one exception is a `docs-next-sync` PR under review: it legitimately carries a submodule move, so you check out the submodule **at that PR's pinned commit** (not library `main`) to validate it — see "Handling `docs-next-sync` PRs" in Step 2.

## Step 1 — Enumerate the queue

```bash
gh pr list --base next --state open --json number,title,headRefName,author,isDraft,mergeable,files
```

Skip drafts unless the user names them. For any PR whose `headRefName` lives in a fork (push access not guaranteed), note it — the fix-in-place step in Step 3 can't push there, so it falls back to comment-and-hold. Flag PRs that touch the **same files** as each other up front: they will conflict on merge, so they need an order (Step 4).

Identify the **`docs-next-sync` PRs** in the queue (head branch `docs-next-sync/auto-*`, title `docs-next-sync: … (automated)`, diff touches `library_repos/*` + `docs-sources.json`). They are in scope and merge into `next`, but they move submodules, so they take the extra validation in "Handling `docs-next-sync` PRs" below — and two of them almost always conflict (both touch `docs-sources.json` and the same submodule), so they need ordering in Step 4.

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

### Handling `docs-next-sync` PRs

A `docs-next-sync` PR carries a submodule move, so it needs source-of-truth handling an ordinary PR doesn't — and because these PRs are opened automatically and can sit for a while, they are frequently **stale relative to each other, to the current `next` tip, and to library `main`**. Before validating its prose, establish the lay of the land:

```bash
# the PR's pinned target commit (from its docs-sources.json / submodule diff)
gh pr diff <NN> | grep -A1 'library_repos/<lib>'
# current next's pin, and the live library main tip
node -p "require('./docs-sources.json').libraries['<lib>'].commit"
git -C library_repos/<lib> fetch origin main && git -C library_repos/<lib> rev-parse origin/main
```

Then resolve, in this order:

1. **Ancestry — never regress.** Confirm the PR's target commit is a descendant of `next`'s current pin (`git -C library_repos/<lib> merge-base --is-ancestor <next-pin> <pr-target>`). A PR whose target is **behind** the current pin would move the submodule backward — don't merge it as-is; it's stale. (Two queued sync PRs are usually linear: the older one's target is an ancestor of the newer's.)
2. **Superseded check — is the change already in `next`?** A sync PR's prose may already have landed (a later sync, a hand edit, or a one-off PR got there first). Grep `next` for the specific fact the PR changes. If it's already present (often in fuller wording), the PR is **superseded** — close it with a comment pointing at where the content already lives, and let a newer sync PR carry the submodule bump. Don't merge a no-op-with-conflicts.
3. **Validate the surviving facts at the PR's pinned commit.** Check the submodule out at the target (`git -C library_repos/<lib> checkout <pr-target>`) and `pnpm build:source-packages`, so the TS-compile and CLI gates judge the PR against the source it claims to document. Re-verify each factual claim there per STYLE.md's source map (a new CLI flag, a changed default, a removed API).
4. **Reconcile against concurrently-merged PRs.** A sync PR is written against the `next` it branched from. If this sweep already merged a PR that rewrote the same section (e.g. one reframed the auth settings around `app.toml` while the sync PR edits the old imperative-flag table), the sync PR's diff is stale framing. Don't merge it verbatim and regress the section — re-apply the *fact* (the part the library actually changed) on top of the current `next` wording, fixing every place that states it (the sync rule cuts both ways). The mechanics for landing this through the PR are in Step 4.
5. **Pin and re-stamp.** With the submodule at the validated target, `pnpm render:guides` (if templates changed) and `pnpm stamp:sources` so `docs-sources.json` + `guides.json` match the new HEAD, then run the full Step 2 gates — the source-stamp and CLI gates only pass when the pin, the working-tree submodule, and the docs agree.

If truing all the way to library `main` (a target newer than any open PR pins) would pull in **other** library changes the open PRs don't cover, that broader true-up is `docs-next-sync`'s job, not this sweep's — surface it as a `needs-judgment` question (true-up-to-main now, or merge only what the PRs target and leave the rest for a `docs-next-sync` run) and report whatever you leave behind.

## Step 3 — Resolve judgment calls, then fix in place

Work every PR to merge-ready. Two kinds of work get it there:

**Get the judgment questions answered.** Collect the `needs-judgment` questions from across the whole validation pass and surface them to the user **together** (one consolidated round via AskUserQuestion where the choices are discrete — fewer interruptions than asking per-PR), each question naming the PR, the finding, and the options. Don't guess and don't defer: a PR can't merge until its question is resolved, and resolving it is this skill's job. If an answer needs more back-and-forth, keep at it until the disposition is settled. The user's answer *is* the fix's spec.

**Apply the fix on the PR's own branch**, following **docs-editorial** — for both mechanical fixes and the now-decided judgment calls:

- Examples live in the corpus (`examples/<subject>/<op>.{ts,swift}`) — fix both languages, never an inline fence in one doc.
- Guide edits go through the `.template.md` + `pnpm render:guides`; never hand-edit a rendered build.
- The sync rule cuts both ways — if a fact is wrong, fix every place that states it, not just the one the reviewer flagged.
- A decision to file a parity bug rather than document a gap means *doing both*: scope the prose to the one language's block per STYLE.md **and** file the bug per `.claude/ISSUE_FILING.md` (which repo, the `ios` label for Swift-client gaps, no assignee unless told).
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

**Issue closing at `next`-merge is automated — verify it, don't redo it.** GitHub only runs a PR's closing keywords (`Fixes #NN` / `Closes #NN` / `Resolves #NN`) when the PR merges into the repo's **default branch (`main`)**. These PRs target `next`, so the keywords never fire on merge, and `gh pr view --json closingIssuesReferences` comes back **empty for every `next`-based PR** — that is structural, not a malformed body, so don't treat the empty list as a defect or try to "fix the link." Keep the `Fixes #NN` line in each PR body regardless: it's what the `close-issues-on-next-merge` workflow parses — on every PR merged into `next` it closes each referenced open issue with a back-reference comment (and the keyword fires again, harmlessly, at publish). So after each merge, **spot-check the workflow did its job** (each closed issue carries its comment) rather than closing by hand. If it failed or a PR predates it, the manual fallback is the same parse:

```bash
# Fallback only — normally close-issues-on-next-merge.yml does this on merge.
gh pr view <NN> --json body,title --jq '[.body, .title] | join("\n")' \
  | grep -oiE '(fix(e[sd])?|close[sd]?|resolve[sd]?)[[:space:]]+#[0-9]+' \
  | grep -oE '#[0-9]+' | tr -d '#' | sort -u \
  | while read -r ISSUE; do
      gh issue close "$ISSUE" --reason completed \
        --comment "Fixed by #<NN>, merged into \`next\`. Closing manually — \`next\` isn't the default branch, so the PR's closing keyword won't fire until this reaches \`main\` at publish."
    done
```

(Relying on the GitHub keyword alone is the defect that stranded #133–136 open after their PRs merged — closure has to happen at `next`-merge, which is exactly what the workflow does.) After the sweep, spot-check with `gh issue list --state open` and close with evidence anything a merged PR resolved that's still dangling — a PR whose body *lacked* the `Fixes` line is the common leak.

Merge the flagged same-file PRs **one at a time**, newest-validated first or in whatever order minimizes rework; after each merge, rebase the next conflicting PR on the updated `next` and re-run its Step 2 gates before merging it — a clean validation against a stale base isn't a clean merge. Keep `next` green at every step: the source-stamp gate must still pass after each merge. A `docs-next-sync` PR moving a submodule is expected (that is the whole point of it) — its bundled `docs-sources.json` re-stamp keeps the gate green; what must never happen is a submodule move *backward* (Step 2 ancestry check) or a stamp that disagrees with the pinned HEAD.

**Order the `docs-next-sync` PRs last**, after the ordinary editorial PRs they overlap have landed — that way you reconcile their facts onto the final `next` wording, not onto a base you're about to overwrite. Merge them oldest-target-first so the submodule only ever moves forward.

**Landing a reconciled sync PR.** When Step 2 had you re-apply a fact on top of current `next` (rather than the PR's stale diff), put that reconciled state through the PR so it still counts as merged, not committed straight to `next`: branch from `next`, make the reconciled edits + submodule checkout + `stamp:sources`, commit, and force-push to the PR's head branch (`git push --force origin <reconcile-branch>:<pr-head-ref>`). Confirm the PR's diff vs `next` is now exactly your reconciliation, then merge with the base-assert below. A superseded sync PR is **closed**, not merged (Step 2), with a comment pointing at where its content already lives.

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
| #NN | docs-next-sync: validated at pinned <sha>, re-stamped, merged into next |
| #NN | docs-next-sync: fact reconciled onto current next (<what>), re-stamped, merged into next |
| #NN | docs-next-sync: CLOSED — superseded (content already in next at <where>) |
| #NN | NOT merged — fork branch without push access; findings posted for the author |
| #NN | skipped — based on main (docs-publish-release's domain, incl. production pushes) |

For a `docs-next-sync` PR, also record the submodule pin `next` ended on and anything deliberately **not** trued (library changes newer than the merged pins, deferred to a `docs-next-sync` run) — silent truncation reads as "fully current" when it isn't.

Close with the `docs-set-audit` result: clean bill, or the cross-page findings and which were fixed vs. proposed to the user.
