# Review: docs/getting-started/prompts.md

**Tier:** Concept page (`docs/getting-started/prompts.md`, parallel to `workflows.md`).

**Verdict:** Well-structured and on-altitude — the ramp is monotonic (concept → create → variables → configs → testing → execute → workflow integration → next steps), the platform/standards lenses are clean, and example parity is satisfied. One high-severity factual error: the prompt-body template variable namespace is wrong throughout, which would make every copy-pasted example silently render empty strings.

## Findings

| # | Severity | Lens | Location | Issue | Fix |
|---|----------|------|----------|-------|-----|
| 1 | high | facts | prompts.md:15-19, 28-34 | Template bodies are documented as reading caller variables under `variables.*` (`{{ variables.style }}`, `{{ variables.text }}`, "The values you pass at execution time are exposed under `variables`", `{{ variables.name \| default:"Anonymous" }}`, `{{ variables.items[0].name }}`). The template engine places execution-time `variables` under the context key **`input`**, not `variables`. There is no `variables` key in the render context, so these all resolve to empty string (missing paths fail silent). | Replace `variables.` with `input.` in every prompt-body reference. Body example becomes `Summarize the following text in {{ input.style }} style:` / `{{ input.text }}`; the Template Variables section becomes "exposed under `input`" with `{{ input.text }}`, `{{ input.name \| default:"Anonymous" }}`, `{{ input.items[0].name }}`. |

### Verification trail for finding #1

- `src/services/block-executor.ts:220` builds the render context with `buildTemplateContext({ input: templateVars, selected: templateVars, ... })` — caller `variables` are bound to `input` (and its alias `selected`), never to a key named `variables`.
- `src/workflows/runner/templates.ts:5,40` — `TemplateContextInput` exposes `input`/`selected`/`steps`/`outputs`/`meta`/`output`; path resolution "walks `input.*`". No `variables` namespace exists.
- `src/workflows/steps/prompt-step.ts:106` passes the step's `variables` map down to the same executor, so workflow-invoked prompts read `{{ input.* }}` too.
- The agent guide already documents this correctly: `guides/latest/AGENT_GUIDE_TO_PRIMITIVE_PROMPTS.template.md:13` ("read as `{{ input.foo }}`") and the variable-access block at lines 40-44. **This is a JS↔guide / human-doc content-sync drift, not a platform bug** — the page is simply wrong against shipped behavior; no issue to file.

> Note: the `[steps.variables]` TOML table in "Executing a Prompt from a Workflow" (prompts.md:88) is **correct** and should not change — that key is how a workflow step *supplies* variables. The bug is only in how variables are *referenced inside a template body*. The fix is asymmetric: supply via `variables`, read via `input`.

## Lens-by-lens (clean passes)

- **Ramp & altitude — clean.** Opens with a one-paragraph concept, then the simplest action (create + push), then variables, configs, testing, execution, and finally workflow composition + next steps. Nothing advanced sits above something basic; no exhaustive option matrices (the configs/tests sections show representative flags, not full matrices — correct for a concept page).
- **Tone & audience — clean.** No talking down, no reference-depth option dumps. Each section introduces a concept and shows it in practice. The "why" for configs ("A/B a cheaper model against a higher-quality one without touching the prompt body") is concrete and earns its place.
- **Standards / never-say — clean.** No links into `guides/latest/`; no Cloudflare/infra internals; no "coming soon" / missing-feature asides; no prior-behavior or version framing. The workflow integration is framed on its own terms as a **parallel concept** ("a prompt is a single managed LLM call, a workflow is a multi-step pipeline") rather than as an appendage — matches the concept-boundary rule. The Analytics next-steps blurb describes analytics on its own terms.
- **Example parity — clean.** `scripts/check-example-parity.mjs` classifies the only code-pair (line 67, the execute example) as `corpus-pair`; all other fences are `neutral` (TOML config and CLI shell — no cross-platform counterpart needed). The execute example resolves from the `examples/prompts/prompt-execute.{ts,swift}` corpus, which enforces JS/Swift parity mechanically.
- **Facts (other than #1) — verified clean.** Against published `primitive-admin` (CLI 1.0.49) and `library_repos/js-bao-wss`:
  - `primitive sync push --dir`, `prompts configs create/activate`, `prompts tests create/run-all` all exist with the cited flags (`--provider`, `--model`, `--temperature`, `--name`, `--vars`, `--contains`).
  - Provider enum `openrouter | gemini` matches `configs create --provider` default/help; models `gpt-4o-mini` / `gemini-2.5-pro` are free-form `--model` strings. Temperature `0.3`/`0.7` within the documented `0-1` range.
  - Verification types ("substring `contains`, regex pattern, JSON subset, and LLM-as-judge") map to `tests create` flags `--contains` / `--pattern` / `--json-subset` / `--evaluator-prompt`.
  - Execute result `output` field and optional `configId` override: confirmed on `ExecutePromptResult` and `ExecutePromptOptions` (`JsBaoClient.ts:382-401`).
  - Workflow step `kind = "prompt.execute"` with `promptKey`, `saveAs`, and `[steps.variables]`: confirmed in `src/workflows/steps/prompt-step.ts` and `src/workflows/runner/types.ts:65`.
  - Analytics event `prompt.executed`: confirmed at `src/app-api/controllers/prompts-controller.ts:87`.
  - The `default:"Anonymous"` filter (no space after colon) parses identically to `default: "Anonymous"` — filter name and args are `.trim()`'d (`templates.ts:344-345`). Not a finding.

## Sync reminder

Finding #1 is a fact change. After fixing the page, confirm `guides/latest/AGENT_GUIDE_TO_PRIMITIVE_PROMPTS.template.md` is consistent (it already uses `input.*`, so no edit is expected there — this is the page catching up to the guide). No corpus example changes are needed (the execute corpus already uses the SDK `variables` option correctly). Run `pnpm render:guides` and `pnpm check:examples` if any shared content is touched.
