# Prompts

A **managed prompt** is a versioned, testable LLM prompt template stored on the server. Your app (or a workflow) invokes the prompt by key; the server renders the template, calls the configured model, and returns the result. Because the prompt lives in config rather than in your code, you can iterate on wording, switch models, and validate behavior with test cases — without redeploying your app.

## Creating a Prompt

Define a prompt in TOML and push it with `sync push`:

```toml
# config/prompts/summarizer.toml
[prompt]
key = "my-summarizer"
name = "Document Summarizer"
status = "active"
body = """
Summarize the following text in {{ variables.style }} style:

{{ variables.text }}
"""
```

```bash
primitive sync push --dir ./config
```

## Template Variables

The values you pass at execution time are exposed under `variables`:

```
{{ variables.text }}                          # Caller-provided variable
{{ variables.name | default:"Anonymous" }}    # With fallback
{{ variables.items[0].name }}                  # Nested access
```

## Prompt Configurations

A prompt can have multiple configurations for different providers, models, and settings. Each prompt has one active configuration; callers invoke the active one unless they ask for a specific config ID. This is how you A/B a cheaper model against a higher-quality one without touching the prompt body:

```bash
primitive prompts configs create <prompt-id> --name "fast" \
  --provider openrouter --model gpt-4o-mini --temperature 0.3

primitive prompts configs create <prompt-id> --name "quality" \
  --provider gemini --model gemini-2.5-pro --temperature 0.7

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
