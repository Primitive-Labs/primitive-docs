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

The docs↔guides mapping is **data, not memory**: `scripts/sync-map.json` pairs each page with its guide template, lists the deliberately unpaired surfaces (pages like the landing page and CLI; the performance guide), and notes the section-level pairs — some templates pair with a *section* of a page (e.g. `working-with-documents.md`'s Document-Scoped Blobs section ↔ `..._BLOBS.template.md`; `workflows.md`'s `script` step section ↔ `..._SCRIPTS.template.md`). Look each changed file's counterpart up there. `node scripts/check-sync-map.mjs` (part of `pnpm check:examples`) fails when a page or template exists with no map entry, so the map stays current — a new page or guide means adding its entry (pair or unpaired) in the same change. Unpaired surfaces sync against nothing — skip them.

## Step 2 — Extract and compare the changed claims

For each changed file, list the **factual claims** the diff added, removed, or altered: API names and signatures, CLI commands and flags, TOML fields and shapes, enums, limits, defaults, behavioral statements. Then check each claim's counterpart file:

- **Changed fact** → the counterpart must state the new fact (grep for the old value — if it still appears, that's a sync failure).
- **New content** → the counterpart needs it at its own altitude (a new capability documented for humans needs the guide's reference-depth treatment; a new guide footgun usually needs at most a sentence on the human side, sometimes nothing — judge by whether a getting-started reader needs it).
- **Removed content** → if it was removed as *wrong*, the counterpart must not still say it. If it was removed for altitude reasons only, the guide keeping it is correct.

Tone, ordering, and depth differences are **not** findings. Only factual divergence is.

## Step 3 — Verify the mechanical state

- Templates changed → confirm builds were re-rendered: `node scripts/render-guides.mjs --check` (or run `pnpm render:guides`).
- `pnpm check:examples` (includes the guides.json contract check).
- Guide added/removed/renamed → `guides.json`'s hand-maintained `relatedGuides`/`prerequisites` must still name existing topics — `node scripts/sync-guides-json.mjs --check` validates this (also part of `check:examples`). When a guide is removed, repoint references to wherever its content moved, don't just delete them.
- Never edit `.ts.md` / `.swift.md` directly — fixes go in the `.template.md`.

## Reporting

A short table: changed file → counterpart → in sync? For each failure: the claim, where it's stale, and the edit that fixes it. If everything is mirrored, say so in two lines — don't manufacture findings.
