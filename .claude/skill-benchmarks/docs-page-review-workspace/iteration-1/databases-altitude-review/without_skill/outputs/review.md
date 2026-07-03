# Review: `working-with-databases.md` (getting-started)

**Page under review:** `/Users/carl/coding/primitive-docs/.claude/skills/docs-page-review-workspace/fixtures/working-with-databases.md`
**Stated as:** `docs/getting-started/working-with-databases.md` — a getting-started page for developers new to Primitive.

## Verdict

The page is **technically strong and accurate, but pitched too high in detail and too flat in structure for a getting-started audience**. It currently reads as a near-complete *reference* for the databases feature surface rather than an onboarding page. A developer new to Primitive will get a clean mental model and a working first database from the first ~100 lines, then hit ~450 lines of advanced/edge-case material (conditional filter gates, schema-gate error codes, pipeline step-reference tables, per-phase timing breakdowns) with no signal about what's core vs. what they can skip.

Net: the content is good; the *altitude* and *progressive disclosure* need work. Below are the specific issues, ordered by impact.

---

## Calibration against peer pages

I compared against the other getting-started pages to establish the expected altitude:

| Page | Lines |
|---|---|
| access-control | 92 |
| choosing-your-data-model | 92 |
| blobs-and-files | 85 |
| users-and-groups | 156 |
| authentication | 230 |
| workflows | 437 |
| working-with-documents | 573 |
| **working-with-databases (fixture)** | **676** |

This fixture is the **longest getting-started page by a wide margin** — ~18% longer than the documents companion and ~55% longer than workflows. The two heaviest peers (documents, workflows) are themselves the deepest features, so some length is justified, but 676 lines with 21 H2 sections is past the point where a newcomer can navigate by reading. The page needs either trimming or clear "core vs. advanced" sectioning.

**Note on snapshot drift:** the fixture is **not** identical to the live shipped page (`docs/getting-started/working-with-databases.md`, 546 lines). The fixture is a 130-line-longer, more verbose variant — it adds "SQLite-backed" and "raw SQL" phrasings, an extra duplicated code-group, and more elaborate subscription prose, while the live page uses a tighter `[[subscriptions]]` write-up. Several issues below are *more* pronounced in this fixture than in the shipped page; where relevant I note it. (The review is of the fixture, as requested.)

---

## Structure & navigation

1. **Flat, undifferentiated section list.** There are 21 H2 sections in a single linear stream, with no grouping into "core path" vs. "going further." A newcomer needs roughly: concept → quick start → operation types → access control → next steps. Everything else (Timestamps, Triggers, Auto-Populated Fields, Default Access, Schema Gate, Field Types, Codegen, CSV Import, Pipelines, Optional Filter Fields, Conditional Filter Gates, Subscriptions, Listing/Discovery, Operation Timing) is advanced or reference material interleaved at the same visual weight. Recommend either (a) splitting the advanced half into a separate "Databases — Advanced" / reference page, or (b) adding a short "Beyond the basics" divider H2 and demoting the deep sections beneath it, so the reader knows the onboarding job is done after Access Control.

2. **"Conditional Filters (Boolean Gates)" is too deep for this page.** Lines 474-506 cover short-circuiting `$and`/`$or` arrays with boolean substitution, the settings-record pattern, and pipeline-gated visibility. This is a genuinely advanced authorization technique with a truth-table and two worked classroom examples. It belongs in an access-control or patterns page, not in a getting-started intro. Same applies to a lesser degree to **Optional Filter Fields** (442-472), which carries three admonitions of its own.

3. **"Operation Timing" (655-669) is a debugging/reference detail.** Per-phase millisecond breakdowns (`doInvocation`, `responseProcessing`, etc.) are useful but are the last thing a newcomer needs; this reads like a reference appendix and would be better in devtools/reference.

4. **Discovery section is large and could be its own thing.** "Listing and Discovering Databases" (556-618) is five subsections covering `list()` vs `get()` semantics, group-based permissions, and the database-ID-as-group-ID convention. Valuable, but it's a meaty topic that competes with the onboarding narrative.

5. **Good structural choices worth keeping:** the numbered Quick Start (Create → Define → Push → Use) is exactly right; the per-operation-type sections each with a `**Response:**` shape are well-formed; the CEL variable / trigger / pipeline tables are clear and scannable.

---

## Altitude & level of detail

The page repeatedly drops below getting-started altitude into error-code- and edge-case-level reference:

- **Schema Gate (335-378)** names specific server error codes (`OPERATION_REFERENCES_UNDEFINED`, `SCHEMA_BREAKS_OPERATIONS`, `SCHEMA_HAS_UNCHECKABLE_OPS`, `OPS_EXIST`), the `refs` array, dynamic-reference warnings, and `--accept-warnings`. This is reference-manual depth on an optional feature. A newcomer needs "you can optionally declare a schema and the server will catch operations that reference fields that don't exist" — the error-code taxonomy can live in a reference page.
- **Apply-to-Query truncation protocol (164-166):** "re-run until `truncated: false`" is a real concern but an advanced one.
- **Subscription internals (508-554):** `originConnectionId`/`originUserId`, per-recipient `isOrigin`/`isOriginUser`, workflow-origin null semantics, and the HTTP-400-on-`database.*`-in-filter rule are deep operational details for an onboarding page.

These aren't wrong — they're just two altitudes too low for "new to Primitive." The fix is to state the capability and link/defer the mechanics.

---

## Concrete defects (independent of altitude)

1. **Duplicated example block.** The identical `db-execute-operation` code-group is included twice — lines 95-97 (under "4. Use in Your App") and again lines 124-131 (under "Queries"). The second inclusion adds nothing the first didn't show.

2. **The same fact stated three times.** "Callers can override `limit`, `cursor`, and `direction`…" appears at line 101 ("just change the operation name and params"), line 120 ("Callers can override `limit`, `cursor`, and `direction` at call time:"), and again line 130 ("Callers can also override `limit`, `cursor`, and `direction` in the third argument"). Lines 120 and 130 are nearly verbatim duplicates bracketing the redundant code-group from defect #1. Collapse to one statement.

3. **"SQLite-backed" (line 3) leaks the storage engine.** Per the repo's standard of describing developer-facing impact rather than backend internals, "SQLite-backed" should be dropped (the live shipped page already omits it — the fixture re-added it). "Isolated, server-side data store" already conveys what the developer needs; the engine is an implementation detail that can change.

4. **"raw SQL" (line 16) is slightly self-contradicting.** The page's whole thesis is that the store is schemaless JSON accessed via registered operations — there's no SQL surface exposed to begin with, so "You don't write raw SQL in your app" implies a SQL layer that the reader might otherwise reach for. The live page's "You don't write raw queries" is cleaner and consistent with the schemaless framing. Recommend reverting to "raw queries."

5. **Forward-reference ordering in the concept section.** "Schemaless on the Server" (7-10) references `database.celContext`, the `[models.*]` schema, the Schema Gate, and codegen before any of those are introduced. The paragraph at line 10 is dense (registered-operations-as-interface + schemaless + `modelName` semantics + optional schema + validation behavior, all in one block) and would land better split, or deferred until after the Quick Start has shown an operation.

---

## Audience-fit summary

| Reader need (new to Primitive) | Does the page serve it? |
|---|---|
| What is a database / when do I use one | Yes — strong intro + clean documents contrast |
| Create my first database and run an operation | Yes — Quick Start is excellent |
| Understand the operation types | Yes, though "Queries" is cluttered by the duplicated example |
| Basic access control | Yes — CEL patterns table is good |
| Know what's advanced and skippable | **No** — no signal; advanced material sits at equal weight |
| Avoid drowning in edge cases on first read | **No** — error codes, timing, gates, subscription internals interleaved |

## Recommended actions (highest impact first)

1. **Add a "core vs. advanced" boundary.** Insert a divider after "Access Control with CEL" and move (or relocate to a reference/patterns page) Conditional Filter Gates, Optional Filter Fields (mechanics), Schema Gate error codes, Operation Timing, and the deepest subscription internals.
2. **Fix the duplicated `db-execute-operation` code-group and the triple-stated `limit`/`cursor`/`direction` note** (defects #1 and #2) — pure redundancy removal, no content loss.
3. **Drop "SQLite-backed"; restore "raw queries" for "raw SQL"** (defects #3, #4) to match the shipped page and the repo's backend-neutral / schemaless framing.
4. **Trim Schema-Gate and Subscription sections to capability-level**, pushing error-code and origin-flag detail to reference.
5. **Reconcile the fixture with the live page** — the fixture has accreted ~130 lines of verbosity and one outright duplicate over the shipped 546-line version; the shipped page is already closer to the right altitude in several of these spots.
