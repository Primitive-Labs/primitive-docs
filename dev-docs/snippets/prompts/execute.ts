import type { JsBaoClient } from "js-bao-wss-client";

// Execute a prompt by key. JS returns a typed `ExecutePromptResult`.
export async function execute(client: JsBaoClient, promptKey: string) {
  // #region example
  const result = await client.prompts.execute(promptKey, {
    variables: { topic: "otters", tone: "playful" },
    modelOverride: "gpt-4o",
  });
  if (result.success) {
    console.log(result.output, result.metrics.totalTokens);
  }
  // #endregion example
  return result;
}
