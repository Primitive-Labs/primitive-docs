---
name: docs-set-audit
description: Audit the entire Primitive documentation set as a whole — duplication across pages, inconsistent facts, concept-boundary violations, orphan pages, and set-wide example parity. Use this skill when asked to "audit the docs", "review the whole doc set", "check for duplication/inconsistency across pages", or periodically after many accumulated edits. For reviewing a single page, use docs-page-review instead; this skill is the expensive cross-page pass.
---

# Auditing the Documentation Set

Single-page review (docs-page-review) can't see cross-page problems: the same fact stated two ways, a concept taught twice, a page nobody links to. This audit looks only at *between-page* properties. Read `STYLE.md` first — its "Concept boundaries" section defines most of what you're checking.

## Mechanical sweeps first (cheap, run always)

1. **Orphan pages** — every file in `docs/getting-started/` must appear in the sidebar (`docs/.vitepress/config.ts`). A page on disk but not in nav is either to be wired in or deleted (this exact failure shipped once: a stale near-duplicate of the landing page sat unlinked for months).
2. **Build + links** — `npx vitepress build docs` (dead links fail), plus an anchor pass for `./page.md#anchor` references whose heading no longer exists.
3. **Example parity inventory** — `node scripts/check-example-parity.mjs` for the set-wide lone-language list; judge each per STYLE.md's parity rules.
4. **Structure mirror** — every concept page should have its agent-guide counterpart and vice versa (see docs-sync-check's mapping; performance and swift-client guides are the known exceptions).

## Cross-page judgment passes

Fan out one reader per page (parallel subagents work well: each returns the page's topics, every factual claim worth cross-checking, and every concept it *teaches* vs merely *references*), then compare across the set:

- **Duplication** — the same concept taught in full on two pages. One page owns each concept; the others link. Watch especially the centralized concepts (configuration-as-code, CEL access control) being re-explained locally, and shared machinery (test users, sync loop) documented in full twice.
- **Inconsistency** — the same fact stated differently (a limit, an enum, a default, a description of behavior). Any disagreement means at least one page is wrong — resolve against source per STYLE.md, never by majority vote among the pages.
- **Boundary violations** — a capability documented on a collaborator's page instead of its own concept's page; a concept described as an appendage of another; parallel concepts treated asymmetrically (one gets a page, its peer gets a subsection).
- **Set-level ramp** — does the sidebar order tell a coherent story (overview → quick start → concepts → services → tools), and does each page assume only concepts introduced before it?

## Reporting

Findings grouped by type (duplication / inconsistency / boundary / orphan / parity), each with the pages involved, the evidence, and a concrete disposition — which page keeps the content, which gets the link, which fact is correct. Cross-page restructures (moving a section between pages, splitting a page) are *proposals* for the user, not edits to make unilaterally. Cap the report at the findings that matter; a healthy set deserves a short clean bill.
