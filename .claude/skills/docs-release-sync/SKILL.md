---
name: docs-release-sync
description: Update the Primitive documentation from a platform release summary. Use this skill whenever given a production/agent release summary (a "# Production release YYYY-MM-DD (sha)" document with New Features / Bug Fixes / Notes-for-users tables referencing PR and issue numbers), or asked to "sync the docs with the release", "update docs for the latest release", or "what does this release change in the docs". Walks every release item, triages developer relevance, updates affected pages and guides, and proposes homes for new features.
---

# Syncing Docs with a Platform Release

A release summary lists everything that shipped; only some of it belongs in documentation. Your job: walk every item, decide whether it's developer-facing, and bring the docs to the *current* state of the platform. Read `STYLE.md` first — especially "No prior behavior" and "Facts and verification".

## Step 1 — Inventory and open the sources

Parse every row of every table (New Features, Bug Fixes, Cleanup, Performance, Dependencies, Model Changes, Notes for users). For each referenced PR/issue, pull the detail you need:

```bash
gh pr view <num> --repo Primitive-Labs/js-bao-wss            # description + linked issue
gh pr diff <num> --repo Primitive-Labs/js-bao-wss --name-only # what surface it touched
gh issue view <num> --repo Primitive-Labs/js-bao-wss          # original intent + design notes
```

The PR description usually states the developer-facing behavior; the diff file list tells you which surface changed (`cli/` → CLI docs, `src/client/` → client API docs, `src/app-api/` → behavior/limits, `web-admin/` → admin console page, `models.yaml` → usually internal). For large releases, fan the per-item investigation out to parallel subagents and collect structured verdicts.

## Step 2 — Triage every item

Classify each item before touching any doc:

| Class | Test | Action |
|---|---|---|
| **Not developer-facing** | Infra, internal refactors, admin/pipeline tooling, skills, CI, deploy plumbing, model/GSI changes with no API impact | **No doc change.** Record the item + "internal" in your report — silence must be a decision, not an oversight. |
| **Factual change to documented behavior** | The release changes something a doc page or agent guide already states (a flag, a shape, a limit, an enum, a default) | Update every place that states the old fact — both human docs and agent guides. Breaking client changes (e.g. a response-envelope change) get a repo-wide sweep for the stale shape, not just the obvious page. |
| **New developer-facing capability** | A new step kind, CLI command, client API, config surface | Propose where it lands: an existing page/guide section first, by the "capabilities live on their concept's page" rule. If it's a genuinely new area with no natural home, **suggest a new page but get the user's sign-off before creating it.** |
| **Now-released** | Something previously excluded from docs as unpublished (check the validation-followups notes/memory) | The release summary is the evidence it's now live — add it, and clear the follow-up note. |

## Step 3 — Write to the present tense

Docs describe how the platform operates **today**. Never write "now supports", "previously", "as of this release", or migration framing — integrate the new reality as if it had always been true (STYLE.md "No prior behavior"). If an item is a bug fix that makes the docs' existing description *true again*, often no edit is needed at all.

Verify anything you write against source per STYLE.md's source-of-truth map — release notes are summaries, and summaries drift. The release proves the feature shipped; the source defines its exact shape.

## Step 4 — Close the loop

1. Mirror every human-doc change into the matching agent guide template (and vice versa); `pnpm render:guides`.
2. `pnpm check:examples` and `npx vitepress build docs`.
3. Report: a table of every release item → disposition (`internal — no change` / `updated <pages>` / `proposed: <new section/page>` awaiting user input), plus anything the release contradicted in the docs that you couldn't resolve.
