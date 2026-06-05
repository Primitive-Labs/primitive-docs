---
name: docs-editorial
description: Editorial standards for writing Primitive documentation. Use this skill whenever writing, editing, or restructuring anything under docs/ (the human-facing VitePress site) or guides/latest/ (the agent-facing guides) — new pages, copy changes, page splits/merges, sidebar changes, landing-page copy, or guide template edits. Also use it when deciding what level of detail belongs where, whether to document a feature, or how to handle a JS/Swift difference. Trigger even for small doc edits — the standards are easy to violate one sentence at a time. (For reviewing/auditing existing pages, use docs-page-review instead.)
---

# Writing Primitive Docs

**Read `STYLE.md` at the repo root before writing.** It is the canonical standard — this skill just frames how to apply it while authoring.

The essentials you're most likely to violate mid-draft:

1. **Know which reader you're serving.** Human docs (`docs/`) teach a developer new to Primitive — concept, first use case, example; don't talk down, don't explain everything. Agent guides (`guides/latest/`) serve an LLM mid-implementation — dense concepts, patterns, examples, reference tables.
2. **Structure pages as a ramp.** Simple at the top (concept → first use → example), advanced and esoteric below. Nothing advanced above anything basic.
3. **Stay at your tier's altitude.** Overview pages name capabilities, never mechanisms. Concept pages show usage, not exhaustive option matrices.
4. **Concepts on their own terms.** One page per concept; never frame feature A as an appendage of feature B; a concept's capabilities live on its own page.
5. **The never-say list** — asides about CLI/console gaps, anything missing or not-yet-supported (including platform-gap callouts — docs show what's there, not what isn't), prior behavior or change history, infra internals, unreleased features, guides/ links, private repos. These arrive one innocuous sentence at a time. Platform differences are shown by parallel examples, never narrated.
6. **Verify every fact** (API names, flags, limits) against the published CLI and `library_repos/js-bao-wss` source; fiction has shipped before.

Mechanics:

- Guides are built artifacts: edit `.template.md` + `examples/` corpus only, then `pnpm render:guides`. Never edit `.ts.md`/`.swift.md`.
- **Compilable client code in a guide template goes in the corpus, included via `{{ example: <subject>/<op> }}` — never as an inline ts/swift fence, and never inside a `{{#lang}}` block.** The corpus is what gives an example its compile gate and its JS/Swift parity enforcement; an inline fence gets neither, and code tucked into a lang block silently exempts itself from both *and* hides from the other language's build. `{{#lang}}` blocks are for language-scoped **prose** (implementation notes, gotchas); inline fences are for what can't compile standalone (shell commands, TOML, output shapes, one-line fragments). If you're writing more than a fragment of ts/swift in a template, stop and add a corpus pair instead. (The renderer copies inline blocks through unchanged — a legacy-migration affordance, not permission for new ones.)
- Content changed on one side (docs ↔ guides) must be checked on the other.
- Before finishing: `pnpm check:examples`, `npx vitepress build docs`, sidebar/links updated for new or moved pages.
