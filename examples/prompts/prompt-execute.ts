import type { JsBaoClient } from "js-bao-wss-client";

// Run a managed prompt with variables; optionally override the model/config.
export async function runPrompt(client: JsBaoClient, documentText: string) {
  // #region example
  const result = await client.prompts.execute("my-summarizer", {
    variables: { text: documentText, style: "concise" },
    modelOverride: "gpt-4o", // optional; defaults to the active config's model
  });
  // #endregion example
  return result;
}
