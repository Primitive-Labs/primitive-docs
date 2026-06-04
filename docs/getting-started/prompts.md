# Prompts

A **managed prompt** is a versioned, testable LLM prompt template stored on the server. Your app (or a workflow) invokes the prompt by key; the server renders the template, calls the configured model, and returns the result. Because the prompt lives in config rather than in your code, you can iterate on wording, switch models, and validate behavior with test cases — without redeploying your app.

## Creating a Prompt

Define a prompt in TOML and push it with `sync push`. The prompt itself carries identity and status; the template text lives on a **configuration** alongside the provider and model:

```toml
# config/prompts/summarizer.toml
[prompt]
key = "my-summarizer"
displayName = "Document Summarizer"
status = "active"

[[configs]]
name = "default"
provider = "gemini"
model = "models/gemini-3-flash-preview"
temperature = 0.5
systemPrompt = "You are a skilled summarizer. Create clear, accurate summaries."
userPromptTemplate = """
Summarize the following text in a {{ input.style || 'brief' }} style:

{{ input.text }}"""
```

```bash
primitive sync push --dir ./config
```

## Template Variables

You *supply* values under `variables` when executing a prompt; the template *reads* them under `input`:

```
{{ input.text }}                   # Caller-provided variable
{{ input.style || 'brief' }}       # With fallback
{{ input.items[0].name }}          # Nested access
```

## Prompt Configurations

A prompt can have multiple configurations for different providers, models, and settings. Each prompt has one active configuration; callers invoke the active one unless they ask for a specific config ID. This is how you A/B a cheaper model against a higher-quality one without touching the prompt body:

```bash
primitive prompts configs create <prompt-id> --name "fast" \
  --provider openrouter --model gpt-4o-mini --temperature 0.3 \
  --user-template "Summarize: {{ input.text }}"

primitive prompts configs create <prompt-id> --name "quality" \
  --provider gemini --model models/gemini-2.5-pro --temperature 0.7 \
  --user-template "Summarize: {{ input.text }}"

primitive prompts configs activate <prompt-id> <config-id>
```

## Testing Prompts

Define test cases to validate prompt behavior before you activate a change:

```bash
primitive prompts tests create <prompt-id> \
  --name "basic-test" \
  --vars '{"text": "Long article text...", "style": "bullet points"}' \
  --contains '["•"]'

primitive prompts tests run-all <prompt-id>
```

Verification types include substring `contains`, regex pattern, JSON subset, and LLM-as-judge.

## Executing a Prompt from Your App

::: code-group

<<< ../../examples/prompts/prompt-execute.ts#example{ts} [JavaScript]

<<< ../../examples/prompts/prompt-execute.swift#example{swift} [Swift]

:::

The result carries `output` (the generated text); pass `configId` to target a specific config instead of the active one.

## Executing a Prompt from a Workflow

Prompts and [workflows](./workflows.md) are parallel concepts: a prompt is a single managed LLM call, a workflow is a multi-step pipeline. Workflows can invoke prompts with the `prompt.execute` step:

```toml
[[steps]]
id = "summarize"
kind = "prompt.execute"
promptKey = "my-summarizer"
saveAs = "summary"

[steps.variables]
text = "{{ input.documentText }}"
style = "professional"
```

## Next Steps

- **[Workflows](./workflows.md)** — Multi-step server-side automation
- **[Analytics](./analytics.md)** — Prompt executions are tracked automatically (`prompt.executed`, durations, token counts)
- **[Primitive CLI](./primitive-cli.md)** — Full CLI command reference
