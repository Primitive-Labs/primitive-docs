---
name: docs-sync-check
description: Verify that the human docs (docs/) and agent guides (guides/latest/) are in content sync after changes. Use this skill whenever docs or guide templates have been edited and the work is about to be declared done or committed — "check docs/guides sync", "did the guides get updated", "sync check" — and proactively before committing any change that touched only one side of the docs/guides pair.
---

# Checking Human-Doc ↔ Agent-Guide Content Sync

CLAUDE.md's standing rule: the human docs and agent guides must state the same facts at different depths. Edits routinely land on one side only. This skill verifies a change set is mirrored — it checks *facts*, not tone (the sides are supposed to read differently).

## Step 1 — Determine the changed surface

```bash
git diff --name-only HEAD -- docs/ guides/latest/   # or the relevant range/staged set
```

The guide structure mirrors the page structure, so the counterpart is usually the matching name: `working-with-documents.md` ↔ `AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.template.md`, `workflows.md` ↔ `..._WORKFLOWS.template.md`, `invitations.md` ↔ `..._INVITATIONS.template.md`, `choosing-your-data-model.md` ↔ `..._DATA_MODELING.template.md`, `api-integrations.md` ↔ `..._INTEGRATIONS.template.md`, `blobs-and-files.md` ↔ `..._BLOBS.template.md`. Pages with no guide counterpart (landing, quick start, deploying, example apps, admin console, CLI) and guides with no page counterpart (performance, swift-client) sync against nothing — skip them.

## Step 2 — Extract and compare the changed claims

For each changed file, list the **factual claims** the diff added, removed, or altered: API names and signatures, CLI commands and flags, TOML fields and shapes, enums, limits, defaults, behavioral statements. Then check each claim's counterpart file:

- **Changed fact** → the counterpart must state the new fact (grep for the old value — if it still appears, that's a sync failure).
- **New content** → the counterpart needs it at its own altitude (a new capability documented for humans needs the guide's reference-depth treatment; a new guide footgun usually needs at most a sentence on the human side, sometimes nothing — judge by whether a getting-started reader needs it).
- **Removed content** → if it was removed as *wrong*, the counterpart must not still say it. If it was removed for altitude reasons only, the guide keeping it is correct.

Tone, ordering, and depth differences are **not** findings. Only factual divergence is.

## Step 3 — Verify the mechanical state

- Templates changed → confirm builds were re-rendered: `node scripts/render-guides.mjs --check` (or run `pnpm render:guides`).
- `pnpm check:examples` (includes the guides.json contract check).
- Never edit `.ts.md` / `.swift.md` directly — fixes go in the `.template.md`.

## Reporting

A short table: changed file → counterpart → in sync? For each failure: the claim, where it's stale, and the edit that fixes it. If everything is mirrored, say so in two lines — don't manufacture findings.
