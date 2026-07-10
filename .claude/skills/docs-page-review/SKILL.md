---
name: docs-page-review
description: Review a Primitive documentation page (or diff) against the repo's editorial standards. Use this skill whenever asked to review, audit, critique, or check a docs page or agent guide — "review this page", "is this at the right altitude", "audit working-with-documents", "check my docs changes" — and proactively after writing or substantially editing any page under docs/ or guides/latest/ before declaring the work done. Also use it when asked whether a page is too detailed, too shallow, well-structured, or consistent with the rest of the docs.
---

# Reviewing a Primitive Docs Page

Produce a findings-based review of one or more documentation pages against `STYLE.md` (repo root) — read it first; it is the standard you are checking against, and every finding must cite which of its rules is violated. If a recalled memory or older convention conflicts with STYLE.md, **STYLE.md wins** — it is kept current; memories may lag policy changes. (Notably: neither human docs nor agent guides document platform gaps or differences — guides scope one-language content via `{{#lang}}` blocks, and gaps become filed bugs.) This skill exists because these violations arrive one plausible sentence at a time and survive authoring even when the author knows the rules — the value is a *fresh-eyes pass with focused lenses*, not general impressions.

## Scope and setup

1. Identify the scope: a page, a set of pages, or a git diff. For a diff, review the changed regions in the context of their full pages.
2. Classify each page's **tier** (landing/overview, concept page, or agent guide — see STYLE.md's tier table). The tier determines what "too deep" and "too shallow" mean; state the tier in your report.
3. Read the whole page before judging any part — ramp violations are ordering problems, invisible line-by-line.

## The lenses

Run each lens as its own deliberate pass over the page. A combined pass reliably misses what a focused one catches.

### 1. Ramp and altitude

- Does the page open at its tier's entry altitude (concept → first use case → example)?
- Does depth increase monotonically? Flag any advanced/esoteric material sitting above or between basic sections.
- For **agent guides, the question inverts**: the goal is comprehensiveness — what's *missing*? (operations, parameters, error codes, footguns, limits). Compare against the corresponding human page and the client/CLI surface for gaps.
- Is everything present at an altitude consistent with the tier — no exhaustive option matrices on concept pages, no mechanism detail on overview pages?

### 2. Tone and audience

- Human docs: does anything talk down (explaining general programming concepts) or over-explain (reference-depth coverage of every option)? Is each concept introduced clearly with an example of putting it into practice?
- Agent guides: any narrative warm-up, feature-selling, or rhetorical filler an LLM doesn't need? Are patterns and examples concrete? And is the guide **generic-first**: concepts and contracts introduced platform-neutrally, with per-language examples and clearly-scoped platform notes/gotchas carrying the specifics? A guide structured as "web by default, iOS as a delta" is a structural finding, not a tone nit.

### 3. Standards (the never-say list + concept boundaries)

Check every item in STYLE.md's "Things human docs never say" and "Concept boundaries" sections. The highest-recurrence offenders: inconsistency asides, missing-feature/platform-gap mentions (docs show what's there, not what isn't), narrated platform differences (parallel examples speak for themselves), features framed as appendages of other features ("data that workflows act on"), capabilities documented on a collaborator's page, and cross-page duplication of a centralized concept (config-as-code, CEL) instead of a reference to it.

### 4. Example parity

Run the inventory scoped to the page:

```bash
node scripts/check-example-parity.mjs docs/getting-started/<page>.md --json
```

For each `lone-js` / `lone-swift` block, judge: would a reader on the other platform be stuck without a counterpart? Protocol illustrations and platform-specific tooling sections are fine alone; core usage examples are not. Where parity matters, the preferred fix is promoting the example into the `examples/` corpus (which enforces parity mechanically), not hand-writing a second inline block.

For **agent guide templates**, also sweep for compilable code that bypassed the corpus: ts/swift fences written inline in the template, and especially code fences inside `{{#lang}}` blocks (which additionally hide the code from the other language's build). Either is a finding — such code gets no compile gate and no parity enforcement; the fix is a corpus pair plus a `{{ example: }}` placeholder. Lang blocks are for prose; inline fences are for what can't compile standalone (shell, TOML, output shapes). A quick inventory:

```bash
grep -n '```\(ts\|typescript\|js\|javascript\|swift\)' guides/latest/*.template.md
```

Also sweep TOML examples for **JSON stuffed into a string** where the platform accepts native TOML (STYLE.md, Platform treatment): any `definition = '{...}'` / `params = '{...}'` in an example block is a finding — the fix is the nested-table form (`[operations.definition]`, `[[operations.params]]`, `[steps.params.<field>]`). Prose mentions of the JSON-string encoding (recognition, `migrate-toml`) are fine; example blocks teaching it are not. Surfaces whose platform contract is a JSON-encoded string (prompt test-case fields) are exempt. Inventory:

```bash
grep -n "definition = '\|params = '\|= '{" docs/getting-started/*.md guides/latest/*.template.md
```

Framework-integration sections (Vue/Pinia, SwiftUI/`PrimitiveApp`) are the common exception to "just promote it" — the binding can't compile in the corpus harness. They should still be **generic-first**: the section leads with the compiled client operation (a normal `{{ example: }}` pair or a reference to where it's shown), and the binding is a `// nocompile` corpus file referenced via `{{ example: }}`, not an inline fence. A binding that exists in only one language carries `// no-parity` and is referenced from inside that language's `{{#lang}}` block. Findings here: a framework section whose load-bearing client call is buried in inline glue instead of led by a compiled example; glue left as a raw inline fence; or a `// no-parity` file referenced from outside a `{{#lang}}` block (it would break the other language's build).

### 5. Facts (`--verify` mode — slower, run when asked or when the page makes API/limit claims)

For every API name, CLI flag, limit, enum, and behavioral claim, verify per STYLE.md's "Facts and verification" section — it includes the source-of-truth map (everything is checked out under `library_repos/`): published CLI via `--help`, client API in `library_repos/js-bao-wss/src/client/api/`, server limits in controller source, TOML shapes against the sync serializers/parsers and template engine in `js-bao-wss`. The `primitive-app-demo` projects are reference, not ground truth — never settle a correctness question from them. Treat numbers, enum value lists, and TOML field names with the most suspicion — they are the most common fiction. Remember released ≠ merged. For broad pages, fan this lens out to an Explore subagent.

**Don't stop at the first big find.** Verification anchoring is this lens's known failure mode: finding one major error feels like "the" finding, and adjacent errors in the same code block go unchecked. Inventory every checkable claim first (each field name, each enum value, each number), then verify the full list — a wrong template namespace and a wrong TOML shape often travel together.

### 6. The one-liner sweep (last, always)

Violations of the never-say list hide in parentheticals and survive the broader lenses — a `(SQLite-backed)` aside in an otherwise-clean intro, a "currently" or "yet" implying a gap, a "legacy alias" label. Finish with a deliberate line-level sweep for the marker words: infrastructure names (Cloudflare, R2, Durable Object, SQLite, Workers), gap markers ("not yet", "currently only", "doesn't support", "coming soon"), history markers ("previously", "legacy", "used to", "now supports"), and platform-contrast phrasing ("in JavaScript … in Swift" prose around examples that already show it).

## Reporting

Open with a two-sentence verdict (tier + overall state). Then findings, most severe first:

```
## Findings

| # | Severity | Lens | Location | Issue | Fix |
|---|----------|------|----------|-------|-----|
| 1 | high | facts | blob-buckets.md:73 | Access policies listed as `public/authenticated/owner/cel`; actual enum is `public-read/authenticated/owner-only` | Correct table; drop CEL row (unreleased) |
```

- **Severity**: `high` = wrong facts, policy violations (never-say list), structural problems needing a restructure; `medium` = ramp/altitude/boundary issues fixable in place; `low` = tone and wording.
- Every finding cites the STYLE.md rule it violates and proposes a concrete fix — quote replacement text for one-liners.
- **False-positive discipline:** report only violations of the written standard, not taste. If a page is clean under a lens, say so in one line — a reviewer that pads findings on clean pages stops being trusted. Cap `low` findings at the five most valuable.
- Platform inconsistencies or surface gaps discovered during review are **bugs to file, not findings to document**: recommend filing in the repo where the fix lives (`js-bao-wss` for clients/server/CLI, `swift-primitive-app-dev` for the Swift app layer, `primitive-app-dev` for the Vue app layer), after checking for an existing issue. No assignee or labels unless told.
- End with the sync reminder when relevant: if fixes change content, the matching `guides/latest` template (or `docs/` page) needs the same facts, and `pnpm render:guides` + `pnpm check:examples` must run.
