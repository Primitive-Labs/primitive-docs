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
3. **Agent guides** are *built artifacts*: edit only `AGENT_GUIDE_TO_*.template.md`, then run `pnpm render:guides` to produce the per-language `.ts.md` / `.swift.md` builds and sync `guides.json`. **Never edit `.ts.md`/`.swift.md` directly.** Templates have two substitution mechanisms:
   - `{{ example: <subject>/<op> }}` — replaced with that variant's corpus example in a fenced block.
   - `{{#lang ts}} … {{/lang}}` / `{{#lang swift}} … {{/lang}}` — language-scoped prose (implementation notes, gotchas) rendered ONLY into that language's build. An iOS agent must never fetch JavaScript gotchas: language-specific prose goes in a lang block or doesn't exist. Shared concept prose stays neutral and unscoped. Platform gaps are never documented in either build — scope a one-language capability's section to that language's block and file the parity bug (see STYLE.md).
4. **Guide structure mirrors page structure** — each concept page in `docs/getting-started/` has a same-boundary guide template (e.g. `workflows.md` ↔ `AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.template.md`), which is what makes the sync rule below checkable.

Validation gates (run before declaring doc work done):

- `pnpm check:examples` — example parity + compilation, TOML validity, guide render/registry checks, and validation of every documented CLI invocation against the *published* `primitive-admin`
- `npx vitepress build docs` — dead links fail the build
- `node scripts/check-example-parity.mjs` — inventory of inline code fences and their language-parity classification

Project skills under `.claude/skills/` automate the editorial loop: `docs-editorial` (writing standards), `docs-page-review` (per-page review), `docs-sync-check` (docs↔guides sync), `docs-set-audit` (whole-set audit), `docs-release-sync` (update docs from a release summary).

## Guide Sync Rule

All changes to user-facing docs (`docs/`) must also be reflected in the corresponding agent-facing guide (`guides/latest/`), and vice versa. The tone and level of detail will differ — user docs are tutorial-style, agent guides are reference-dense — but the content must stay in sync. When updating either side, always check and update the other.
