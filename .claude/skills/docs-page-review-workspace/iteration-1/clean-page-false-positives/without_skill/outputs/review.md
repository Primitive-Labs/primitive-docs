# Docs Page Review — `docs/getting-started/prompts.md` (Prompts)

**Tier:** Concept page (getting-started, parallel to `workflows.md`).

**Verdict:** The page is well-structured and rides a clean ramp (concept → create → variables → configs → testing → execute from app → execute from workflow → next steps), and most facts check out against the published CLI and client API. But it contains a cluster of **factually wrong template/TOML claims** centered on the variable namespace and the prompt TOML schema — high-severity fiction that would make the very first thing a reader copies (the "Creating a Prompt" TOML and every `{{ variables.X }}`) fail to work. Fix those before anything else.

## Findings

| # | Severity | Lens | Location | Issue | Fix |
|---|----------|------|----------|-------|-----|
| 1 | high | facts | prompts.md:30-34 (Template Variables) | Templates are shown referencing the caller's values as `{{ variables.text }}` / `{{ variables.name }}` / `{{ variables.items[0].name }}`. The render engine places caller variables into the template context under the key **`input`** (`block-executor.ts:221` → `input: templateVars`), and every real config in the source tree uses `{{ input.text }}` (e.g. `swift-primitive-app-dev/.../prompts/summarizer.toml`, `primitive-app-dev/.../prompts/mood-analyzer.toml`, `js-bao-wss/test-config/prompts/haiku-generator.toml`). Violates STYLE.md "Facts and verification" (behavior must verify against source). | Replace the namespace: `{{ input.text }}`, `{{ input.name \| default:"Anonymous" }}`, `{{ input.items[0].name }}`. The `default` filter and `[0]` index syntax are themselves valid (`templates.ts:285`, numeric bracket support) — only the `variables.` prefix is wrong. |
| 2 | high | facts | prompts.md:11-20 (Creating a Prompt TOML) | The TOML uses a prompt-level `name = "Document Summarizer"` and a prompt-level `body = """..."""`. Neither field exists in the real schema: the prompt display field is **`displayName`**, and the prompt template is not a `body` on `[prompt]` — it lives on a config as **`userPromptTemplate`** under `[[configs]]` (see all three real config files cited above). A `[prompt]` block with `body` will not produce a working prompt. Violates "Facts and verification." | Rewrite the example to match the real schema: `displayName = "Document Summarizer"`, and move the template into a `[[configs]]` block as `userPromptTemplate = """..."""` (with `provider`/`model`). Use `{{ input.text }}` / `{{ input.style }}` inside it (ties to finding #1). |
| 3 | high | facts | prompts.md:15-19 + :30 | The template body inside the "Creating a Prompt" example also uses `{{ variables.style }}` / `{{ variables.text }}` — same namespace error as #1, in the first code block on the page. | Same fix: `{{ input.style }}`, `{{ input.text }}`. |

## Lens-by-lens

**1. Ramp and altitude — clean.** Opens at concept altitude (one-paragraph definition of a managed prompt), moves to the simplest first action (create + push), then variables, then the common multi-config / testing patterns, then app execution, then the deeper workflow-integration case. Nothing advanced sits above something basic. No exhaustive option matrix on a concept page. Good fit for the tier.

**2. Tone and audience — clean.** No talking-down, no over-explaining of LLM/prompt-engineering basics. Imperative and direct. The "this is how you A/B a cheaper model against a higher-quality one" aside is concrete value, not filler.

**3. Standards (never-say list + concept boundaries) — clean.**
- Prompts and workflows are treated as **parallel concepts**, each owning its page, and the cross-link blurbs describe the target on its own terms ("Workflows — Multi-step server-side automation", "Analytics — ..."). Matches the "parallel concepts get parallel treatment" and "introduce every concept on its own terms" rules.
- The "Executing a Prompt from a Workflow" section opens by explicitly naming them parallel concepts and adds only a factual integration note — it does not relocate a workflow capability onto this page. Correct per "A concept's capabilities live on that concept's page."
- No inconsistency asides, no missing-feature/coming-soon callouts, no prior-behavior/change-history, no Cloudflare/infra internals, no links into `guides/latest/`, no private-repo links. All clear.

**4. Example parity — clean.** `node scripts/check-example-parity.mjs` reports the one bilingual `::: code-group` (line 67, "Executing a Prompt from Your App") as a `corpus-pair` — it includes from `examples/prompts/prompt-execute.{ts,swift}`, so JS/Swift parity is enforced mechanically. Both corpus files exist and match (`client.prompts.execute(...)` with `variables` + `modelOverride`). All other code fences classify `neutral` (TOML / CLI / template snippets — language-agnostic, no counterpart needed). No lone-js/lone-swift gaps.

**5. Facts — mostly verified; see findings #1–#3 for the failures.** Verified against the installed CLI (v1.0.49) and `library_repos/js-bao-wss`:
- `primitive sync push --dir ./config` — valid; `sync push` help lists `prompts/*.toml` and `prompts/{key}.tests/*.toml` in the config tree.
- `primitive prompts configs create <id> --name --provider --model --temperature` and `configs activate <prompt-id> <config-id>` — all flags/args valid; provider enum is `openrouter, gemini` (default `openrouter`), matching the page's two examples.
- `primitive prompts tests create <id> --name --vars --contains` and `tests run-all <id>` — all valid; `--pattern` (regex), `--contains` (JSON array), `--json-subset`, and `--evaluator-prompt`/`--evaluator-config` (LLM-as-judge) flags all exist, so line 63's "substring `contains`, regex pattern, JSON subset, and LLM-as-judge" verification-types list is accurate.
- Client API: `client.prompts.execute(promptKey, options)` returns `ExecutePromptResult` with `output: string` and `configId: string`; `ExecutePromptOptions` includes both `modelOverride?` and `configId?`. So line 75 ("result carries `output`… pass `configId` to target a specific config") is correct, and the corpus example's `modelOverride` override is also a real option.
- Workflow step: `kind = "prompt.execute"` with `promptKey`, `saveAs`, and `[steps.variables]` — verified in `prompt-step.ts` and a real workflow toml (`mood-analyzer-workflow.toml`), which likewise uses `{{ input.text }}` in its `[steps.variables]`. The page's workflow example correctly uses `{{ input.documentText }}` (workflow input namespace) here — that one is fine.
- Analytics event `prompt.executed` — confirmed emitted in `prompts-controller.ts:87`. Line 96's claim is accurate.

## Sync reminder

Findings #1–#3 are factual content changes (variable namespace `variables.` → `input.`; prompt TOML schema `name`/`body` → `displayName`/`[[configs]].userPromptTemplate`). The matching agent guide (`guides/latest/` prompts template / corpus) must carry the same corrected facts. After editing, run `pnpm render:guides` and `pnpm check:examples` (and `npx vitepress build docs` for link integrity).

## Note (not a finding)

No platform/surface bug to file: the JS and Swift clients are in parity here (`prompts.execute` with `variables` + `modelOverride` on both), and the CLI/schema discrepancies above are documentation errors, not product gaps.
