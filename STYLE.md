# Primitive Documentation Style Guide

The canonical editorial standards for this repo. Two documentation products build from this source tree, and almost every editorial mistake comes from blurring them. Everything else in this guide hangs off these two reader contracts.

## The two readers

### Human docs (`docs/`) — a technical developer new to Primitive

Write for a competent developer who has never used Primitive. **Don't talk down** — never explain what OAuth, a cron expression, or a CRDT-style merge is. **Don't explain everything** — exhaustive parameter coverage is the agent guides' and generated reference's job. The job of a human doc is to build the right mental model and show the concept in practice: introduce the concept clearly, give the initial use case, show an example of applying it.

### Agent guides (`guides/latest/`) — an LLM mid-implementation

Write for a coding agent that already decided to use the feature and needs to implement it correctly *right now*. Focus on concepts, patterns, and usage examples, with clear reference tables where they help (parameters, error codes, contexts). No narrative warm-up, no selling the feature, no rhetorical questions. Density is a virtue; every cap, edge case, and footgun earns its place. Guides are built per-language: edit only the `.template.md` (plus the `examples/` corpus), run `pnpm render:guides`, and never touch the generated `.ts.md` / `.swift.md` files.

**Generic first, specific second.** Introduce every concept and platform feature platform-neutrally — what it is, how it behaves, its server-side contract — then get specific through per-language examples and clearly-scoped platform implementation notes and gotchas. Never structure a guide as "web by default, with iOS as a delta": JavaScript and Swift are equal citizens, and the neutral introduction is what both render variants share.

**Language-specific prose goes in `{{#lang}}` blocks — or doesn't exist.** Each agent fetches only its language's build; a Swift agent must never receive JavaScript gotchas. Wrap genuinely needed language-specific *how-it-works* notes (value-type semantics, subscription retention, storage behavior) in `{{#lang ts}}…{{/lang}}` / `{{#lang swift}}…{{/lang}}` so they render only into the matching build. Cross-language *comparisons* ("in JS it's X, in Swift it's Y") serve neither reader — delete them; the per-language examples already carry the difference. And **gaps are never notes**: when a capability exists in one language only, scope its entire section/example to that language's block — the other build simply doesn't mention the feature — and file the parity bug (see `.claude/ISSUE_FILING.md` for which repo, labels, and how). No "not available", no "workaround" framing, in either build.

The two sides must stay in **content sync** — same facts, different depth. When you change one, check and update the other (see CLAUDE.md).

## Page structure: the incremental-reveal ramp

A human doc page is not flat — it's a **ramp sorted by depth**. It opens at the entry altitude for its tier and deepens monotonically as the reader scrolls:

1. **Concept** — what this is and why it exists (a paragraph, not a chapter)
2. **First use case + example** — the simplest thing a new user does with it
3. **The common patterns** — what most apps need
4. **Advanced and esoteric** — power features, tuning, rare-but-real cases

The review question is not "is everything at the same level?" but "**does anything advanced appear above something basic?**" A page can legitimately end deep in the weeds; it can't *start* there, and it can't interleave (a debugging flag between two introductory sections is a ramp violation).

### Page tiers and their entry altitudes

| Tier | Examples | Entry altitude | Ceiling |
|---|---|---|---|
| **Landing / overview** | `docs/index.md` | Capabilities and value — what you get | Never name mechanisms (file formats, codegen commands, schema syntax, specific API shapes) |
| **Concept page** | `working-with-documents.md`, `workflows.md` | Concept + first use | Advanced usage near the bottom; exhaustive option matrices belong in guides/reference |
| **Agent guide** | `AGENT_GUIDE_TO_PRIMITIVE_*.template.md` | Operations and patterns | None — comprehensive is the goal. The audit question flips: *what's missing?* |

## Concept boundaries

- **One page per concept; parallel concepts get parallel treatment.** Workflows and prompts are parallel concepts — each owns a page. Don't bundle concepts because they're often used together.
- **Introduce every concept on its own terms.** Never frame feature A as an appendage of feature B. Databases are not "data that workflows act on"; subscriptions are a client feature independent of workflows. Cross-feature link blurbs describe the target on *its* terms ("Workflows — multi-step server-side automation").
- **A concept's capabilities live on that concept's page.** Database subscriptions belong on the databases page; every way to invoke a workflow belongs on the workflows page. When features compose, write a factual integration note inside a section — don't relocate a capability to its collaborator's page.
- **Centralize cross-cutting concepts, then reference them.** Configuration-as-code lives in `configuring-primitive-services.md`; CEL access control lives in `access-control.md`. Feature pages link there and add only their surface-specific context.

## Things human docs never say

Each of these reads as a small helpful aside and is actually a policy violation:

- **No inconsistency asides.** "(no CLI flag for this yet)", "console-only setting" — gaps between CLI/console/clients are bugs to fix, not facts to document. Describe the intended path; file an issue for the gap (see `.claude/ISSUE_FILING.md`).
- **Nothing that doesn't work or is missing.** Docs show what's there, not what isn't. No "not yet supported", no "coming soon", no feature-gap callouts. If a capability exists on one platform only, document it with the example that exists and stop — the absence speaks for itself.
- **No prior behavior or change history.** Describe how the platform works today, with current best practices. No "previously", "now supports", migration guides, version comparisons, or "legacy" labels.
- **No infrastructure internals.** Never name Cloudflare, Workers, R2, Durable Objects, or storage engines. Describe developer-facing behavior ("isolated, server-side data store"), not implementation. The one exception: *Deploying to Production* necessarily names the deployment target (the web template deploys to Cloudflare Workers) — that page only.
- **No links into `guides/latest/`.** Human docs are self-sufficient.
- **Nothing ahead of the channel's surface.** Each branch documents its channel's platform (see CLAUDE.md): `main` describes the *published* clients and CLI; `next` describes the library `main` tips. The validation gates run against the matching surface (`scripts/channel.mjs`), so "is this documentable here?" has a mechanical answer — never describe something the channel's gates can't see.
- **No private repo links.** Only link repos a new user can open (`primitive-app-template` is public; the `*-dev` repos are not).

## Platform treatment

- **Prose is platform-neutral until code.** "On the device", "your app", "the client" — not "in the browser". Concepts are introduced once, for both platforms.
- **Code examples use `::: code-group` with JavaScript and Swift tabs**, preferring includes from the compiled `examples/` corpus (`<<< ../../examples/...`). The corpus enforces JS/Swift parity mechanically — when an inline example matters on both platforms, promote it into the corpus rather than hand-maintaining two blocks.
- **A lone-language inline block is a deliberate choice**, acceptable when the snippet is protocol illustration where the other language adds nothing — or when the capability exists on one platform only. If a reader on the other platform would be stuck without it *and the capability exists there*, it needs parity. The same test applies to the template dimension (Vue template vs iOS template helpers).
- **Platform differences are shown, never narrated — in both products.** When the two platforms do something differently, parallel code examples speak for themselves; don't add prose pointing out the difference. When a capability is missing on one platform: in human docs, show the example that exists with no gap callout; in agent guides, scope the feature's section to the language that has it via `{{#lang}}` blocks so the other build doesn't mention it. Nobody documents the gap — the bug tracker owns it (next bullet).
- **Inconsistencies become bugs, not docs.** When you find a platform inconsistency (or any surface gap), file a bug instead of documenting it. File it in the repo where the fix lives: `js-bao-wss` for the clients/server/CLI, `swift-primitive-app-dev` for the Swift app layer (`PrimitiveApp`), `primitive-app-dev` for the Vue app layer. Check for an existing issue first. Don't assign an owner or add labels unless specifically told to.

## Facts and verification

The docs have shipped fictional APIs before; the validation gates exist because of it. The full platform source is checked out under `library_repos/` — use it:

| Source of truth | Where |
|---|---|
| Core backend, JS client, Swift client, CLI | `library_repos/js-bao-wss` (`src/app-api` server, `src/client` JS, `swift-client/` Swift, `cli/` CLI) |
| Vue template + app layer | `library_repos/primitive-app-dev/primitive-app-template` |
| Swift template + app layer (`PrimitiveApp` package) | `library_repos/swift-primitive-app-dev/swift-primitive-app` |

The `primitive-app-demo` projects in both `*-dev` repos are **helpful reference, not ground truth** — useful for seeing features in real use, but never cite them to settle a correctness question. Correctness comes from the CLI/client/server source in `js-bao-wss` and the template code itself.

When stating any API name, flag, limit, enum, or behavior:

- **CLI claims** → verify against the channel's `primitive-admin` (`node_modules/.bin/primitive <cmd> --help` on production; the submodule-built CLI — `node library_repos/js-bao-wss/cli/dist/bin/primitive.js` — on next); `pnpm check:cli` gates this in CI.
- **Client API claims** → verify in `library_repos/js-bao-wss/src/client/api/*.ts` (and the Swift client for parity claims).
- **Server behavior / limits** → verify in the controller source; numbers ("100 MB", "24 hours") are the most common fiction.
- **TOML shapes and template syntax** → verify against the CLI's sync serializers/parsers and the server's template engine in `js-bao-wss`.
- **Released vs merged**: on the `next` branch, merged to the library's `main` is the documentation bar; the `main` branch describes only what a production release has shipped (docs reach it via `docs-publish-release`, never by writing ahead).

## Voice

- **Why-Primitive copy is concrete.** Lead with real differentiators (local-first sync as the default, one backend for web + iOS, a CLI/TOML surface agents can drive) — never generic platform claims ("production-ready", "scales with you") that any BaaS makes.
- **Explain the why** behind recommendations whose failure mode isn't obvious. The best sections pair every rule with what goes wrong without it.
- Imperative, direct sentences. Cut throat-clearing ("It's worth noting that…").

## Mechanical gates (run them; don't re-derive them)

- `pnpm check:examples` — TOML validity, example compilation, guide render check, CLI invocation validation.
- `npx vitepress build docs` — dead links fail the build.
- New/moved pages go in the sidebar (`docs/.vitepress/config.ts`); retarget inbound links and anchors when renaming.
- `node scripts/check-example-parity.mjs` — inventory of code fences and their parity classification (input to example-parity review).
