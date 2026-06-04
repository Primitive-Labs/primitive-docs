# Landing Page Review — `docs/index.md`

**Page under review:** `.claude/skills/docs-page-review-workspace/fixtures/index.md` (snapshot of the site's `docs/index.md` overview/landing page)

**Tier:** Landing / overview. Per the repo style guide, the entry altitude for this tier is *capabilities and value — what you get*, and its **ceiling** is: "Never name mechanisms (file formats, codegen commands, schema syntax, specific API shapes)." That ceiling is the single most important lens for this page, and it is the page's biggest weakness.

**Verdict:** Solid bones — good capability inventory, clear "Why Primitive?" framing, mostly platform-neutral prose. But it materially overshoots the landing-tier ceiling (a full schema-definition code block and client-construction code block with concrete API shapes), and it carries several violations of this repo's hard rules: browser-centric prose, an infra-internals leak, and a stale single-platform (web/Vue-only) framing that contradicts the platform's "web + iOS, both first-class" positioning. None are subtle once you apply the standards; collectively they make the page read like an earlier draft than the rest of the docs.

---

## Blocking issues (violate a hard rule or the tier ceiling)

### 1. Code blocks exceed the landing-tier ceiling — name mechanisms and API shapes
**Where:** "The Stack" → `js-bao` and `js-bao-wss-client` sections (the `defineModelSchema` / `BaseModel` block, lines ~86–101; the `new JsBaoClient({...})` block, lines ~106–115).

The style guide's tier table is explicit that a landing page must **never name mechanisms** — "file formats, codegen commands, **schema syntax, specific API shapes**." This page does exactly that:
- A complete `defineModelSchema({ name, fields: { id: { type: "id", autoAssign: true, indexed: true }, … } })` block — that is schema syntax and a specific API shape.
- A `new JsBaoClient({ apiUrl, wsUrl, appId, models })` block — specific constructor shape, including config keys (`apiUrl`, `wsUrl`, `appId`).

This is the kind of detail that belongs on the concept pages (`working-with-documents.md`) and in the agent guides / generated reference, not on the overview. The overview should describe *what the library does for you* and let the reader click through. **Fix:** remove both code blocks; describe `js-bao` and `js-bao-wss-client` at the capability level (one or two sentences each), and link to the concept page where the real example lives.

### 2. Prose is browser-centric, not platform-neutral — and the page is effectively web/Vue-only
**Where:** throughout — the architecture diagram header ("Your App (Browser)"), the closing prose ("Your app runs in the browser"), the `primitive-app — Vue Integration` section, and the "What Runs Where" table header ("Your App (Browser)").

The style guide's Platform Treatment section is unambiguous: "**Prose is platform-neutral until code.** 'On the device', 'your app', 'the client' — not 'in the browser'." This page says "Browser" three times in structural elements and "runs in the browser" in prose.

Worse, the framing is single-platform throughout, which contradicts the platform's actual positioning (one backend, web **and** iOS both first-class):
- The intro Quick Start blurb does mention "web (Vue) or iOS (SwiftUI)" — good — but the rest of the page forgets iOS exists.
- "The Stack" presents only `js-bao` / `js-bao-wss-client` / `primitive-app (Vue)` — there is no mention of the Swift client (`JsBaoClient` Swift package) or the iOS template. A reader on iOS would conclude the platform is JS-only.
- The architecture diagram and "What Runs Where" table are browser-only.

The "Framework Flexibility" tip even narrates the landscape JS-first ("plain JavaScript … work with React, Svelte, Solid, or vanilla JS") with no acknowledgment of Swift. This reads as web-only product copy. **Fix:** neutralize prose to "on the device" / "the client library"; make the diagram and table cover "web or iOS"; present the client layer as "a client library per platform (JavaScript for web, Swift for iOS) exposing the same surface," and mention both templates.

### 3. Infrastructure-internals leak
**Where:** closing line of "Architecture at a Glance": "The Primitive backend is a managed service that runs on **edge infrastructure** — you interact with it through the client library and CLI…"

The repo rule (`feedback_no_cloudflare_internals_in_docs` and STYLE.md "No infrastructure internals") says behavioral/conceptual docs must not leak how the backend is hosted; describe developer-facing behavior instead. "Edge infrastructure" is an implementation detail of where it runs. The exception is *Deploying to Production* only — not the landing page. **Fix:** drop "that runs on edge infrastructure"; "a managed service you interact with through the client library and CLI, never directly with the underlying infrastructure" already makes the point.

---

## Altitude / structure issues

### 4. "Why Primitive?" copy is partly generic where the guide demands concrete differentiators
**Where:** "Why Primitive?" section.

STYLE.md Voice: "**Why-Primitive copy is concrete.** Lead with real differentiators (local-first sync as the default, one backend for web + iOS, a CLI/TOML surface agents can drive) — never generic platform claims ('production-ready', 'scales with you') that any BaaS makes."

This page does the opposite of the guidance in two of its three bullets:
- "**Production-ready from day one.**" and "you're building on infrastructure that **scales**" are exactly the generic BaaS claims the guide names as off-limits.
- The page's strongest real differentiators — *local-first sync as the default* and *one backend for web + iOS* — are not Why-Primitive bullets at all. Local-first is buried in a capability description; the multi-platform story is missing.

**Fix:** lead with the concrete differentiators the guide calls out (local-first/CRDT sync by default; one backend for web + iOS; a CLI/TOML surface agents can drive). Cut "production-ready from day one" / "scales" as standalone selling points.

### 5. Architecture diagram is below the tier's natural altitude and is partly broken
**Where:** the ASCII diagram.

Two problems beyond the Browser issue (#2):
- It names the specific libraries `js-bao` and `js-bao-wss-client` inside the box — again mechanism/API-shape detail the overview shouldn't anchor on (a generic "Client library" box is the right altitude).
- The art is misaligned: the right border of the outer box doesn't close (the `js-bao-wss-client ◄──►│` row and the line below it break the box), and the vertical connector down to the backend is ragged. On a landing page the diagram is doing first-impression work; a broken box undercuts it.

**Fix:** simplify to UI ◄► client library ◄► local store over background sync to the platform, platform-neutral, with the box borders aligned.

### 6. Minor altitude wobble in capability descriptions
The "What Primitive Provides" section is mostly at the right altitude (capability + when-to-use), which is good. A couple of entries dip slightly into mechanism — e.g. Workflows says "Define them as **TOML config files** in your repo," and the CLI section says "sync configuration as version-controlled **TOML files**." TOML-as-config is borderline for a landing page (it names a file format). It's defensible as a genuine differentiator (configuration-as-code is one of the platform's selling points), so I'd flag it as *optional tightening* rather than blocking — but note that #1's code blocks are the same kind of overshoot taken much further.

---

## Smaller notes

- **Self-referential link check:** all five internal links (`template-app`, `example-apps`, `choosing-your-data-model`, `working-with-documents`, `working-with-databases`) resolve to existing files — good, no dead links. No links into `guides/latest/` — good (that rule is respected).
- **No legacy/changelog framing** — good; the page describes current behavior only.
- **Analytics entry** ("View metrics in the admin console") is fine at this altitude; just ensure capitalization/naming ("Admin Console") matches the rest of the docs.
- **"The Stack" vs "What Primitive Provides" overlap:** the page lists capabilities once under "What Primitive Provides" and again implicitly under "The Stack" and "What Runs Where." Three near-overlapping inventory sections is a lot for an overview; consider whether "What Runs Where" earns its place once the diagram already shows the split.

---

## How this compares to the current shipped page

For calibration: the live `docs/index.md` already resolves nearly every issue above — it leads "Why Primitive?" with local-first sync and "one backend, every platform," presents the client layer as "js-bao-wss-client for JavaScript … and the Swift JsBaoClient package for iOS," uses a platform-neutral diagram ("Your App (web or iOS)", "on the device"), carries no code blocks, and says "a managed service" with no edge-infrastructure leak. **This fixture reads as an earlier draft that predates those fixes.** The concrete path to "good" is essentially to bring it in line with the current shipped version: drop the two code blocks, neutralize the browser/Vue-only framing to cover web + iOS, remove the edge-infrastructure phrase, and re-lead the Why section with the concrete differentiators.

## Priority order for fixing
1. Remove the two code blocks (#1) — biggest ceiling violation.
2. De-browser-ify and add the iOS/Swift half of the story across prose, diagram, table, and the Stack (#2).
3. Drop "edge infrastructure" (#3).
4. Re-lead "Why Primitive?" with concrete differentiators; cut generic BaaS claims (#4).
5. Fix/simplify the diagram art and de-mechanize it (#5).
