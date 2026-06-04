import type { JsBaoClient } from "js-bao-wss-client";

// Execute a prompt against a specific config and read the typed result fields.
export async function runPromptWithConfig(client: JsBaoClient) {
  // #region example
  const result = await client.prompts.execute("my-prompt-key", {
    variables: { text: "Hello world" }, // → {{ input.text }}
    configId: "01ABC", // optional; defaults to activeConfigId
    modelOverride: "anthropic/claude-3-5-sonnet", // optional; overrides config.model
  });

  result.success; // boolean
  result.output; // string — generated text
  result.error; // string | undefined
  result.configId; // string — which config was used
  result.metrics; // { durationMs, inputTokens?, outputTokens?, totalTokens? }
  result.rawResponse; // any — raw provider response (don't depend on shape)
  // #endregion example
  return result;
}
