# Primitive Docs

Documentation site for the Primitive platform, built with VitePress.

## Project Structure

- `docs/` — User-facing documentation (VitePress markdown; sidebar in `docs/.vitepress/config.ts`)
- `guides/latest/` — Agent-facing guides (consumed by `primitive guides get`; `guides.json` is the CLI contract)
- `examples/` — The compiled per-language example corpus shared by both doc products
- `library_repos/` — Git submodules for source-of-truth library code
- `STYLE.md` — The canonical editorial standards (altitude tiers, tone, never-say rules, platform treatment, fact verification). Read it before writing or reviewing any doc.

## How the Docs Are Built (per-language examples)

Both doc products draw code examples from one corpus so JS/Swift parity is mechanical, not manual:

1. **`examples/<subject>/<op>.{ts,swift}`** — every example id exists for every base language (parity is enforced by `pnpm check:examples`, and examples are compiled against the real clients). The variant registry is `scripts/variants.mjs`.
2. **Human docs** include examples directly: `::: code-group` blocks with `<<< ../../examples/<subject>/<op>.ts#example` / `.swift#example` tabs.
3. **Agent guides** are *built artifacts*: edit only `AGENT_GUIDE_TO_*.template.md`, then run `pnpm render:guides` to produce the builds and sync `guides.json`. Templates with language-specific content build to per-language `.ts.md` / `.swift.md`; concept-only templates (no lang blocks, no example placeholders) build to a single agnostic `.md` and list no variants in guides.json. **Never edit rendered builds directly.** Templates have two substitution mechanisms:
   - `{{ example: <subject>/<op> }}` — replaced with that variant's corpus example in a fenced block.
   - `{{#lang ts}} … {{/lang}}` / `{{#lang swift}} … {{/lang}}` — language-scoped prose (implementation notes, gotchas) rendered ONLY into that language's build. An iOS agent must never fetch JavaScript gotchas: language-specific prose goes in a lang block or doesn't exist. Shared concept prose stays neutral and unscoped. Platform gaps are never documented in either build — scope a one-language capability's section to that language's block and file the parity bug (see STYLE.md).
4. **Guide structure mirrors page structure** — each concept page in `docs/getting-started/` has a same-boundary guide template (e.g. `workflows.md` ↔ `AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.template.md`), which is what makes the sync rule below checkable.

## Branches and Channels

Two long-lived branches, two validation surfaces (`docs-sources.json` `channel`, read via `scripts/channel.mjs`):

- **`main` = production channel = published.** Merging to main publishes the site (gh-pages). Docs describe the released platform: submodules pinned at the last production-release SHA, gates run against the *published* npm packages (pinned devDependencies). publish-docs.yml refuses a non-production stamp.
- **`next` = next channel.** Docs are trued continuously against the library `main` tips (`docs-next-sync` skill). The TS-compile and CLI gates run against the **submodule source** instead of published packages (`pnpm build:source-packages` builds js-bao, js-bao-wss-client, and primitive-admin from `library_repos/`), so merged-but-unreleased work is documentable immediately.
- **Publishing = merging `next → main` at a production release SHA** (`docs-publish-release` skill): never past the release, restamped onto the production channel, verified against the release summary. Hotfixes to published docs go straight to main and flow back into next via merge.

Validation gates (run before declaring doc work done):

- `pnpm check:examples` — example parity + compilation, TOML validity, guide render/registry checks, validation of every documented CLI invocation against the channel's `primitive-admin`, and the source-stamp gate (`docs-sources.json` must match submodule HEADs + the channel's package versions)
- `node scripts/stamp-sources.mjs --changes` — per-library commits since the last doc-truing pass (the doc-impact scan); `pnpm stamp:sources` resets the baseline once docs reflect those sources (also mirrors versions into `guides.json` `builtAgainst` and the site footer)
- `npx vitepress build docs` — dead links fail the build
- `node scripts/check-example-parity.mjs` — inventory of inline code fences and their language-parity classification

Project skills under `.claude/skills/` automate the editorial loop: `docs-editorial` (writing standards), `docs-page-review` (per-page review), `docs-sync-check` (docs↔guides sync), `docs-set-audit` (whole-set audit), `docs-next-sync` (true the next branch against library main), `docs-pr-sweep` (validate, fix, and merge every open next-targeted PR, then audit the set), `docs-publish-release` (merge next→main at a production release).

## Guide Sync Rule

All changes to user-facing docs (`docs/`) must also be reflected in the corresponding agent-facing guide (`guides/latest/`), and vice versa. The tone and level of detail will differ — user docs are tutorial-style, agent guides are reference-dense — but the content must stay in sync. When updating either side, always check and update the other.
