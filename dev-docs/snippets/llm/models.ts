import type { JsBaoClient } from "js-bao-wss-client";

// List available LLM models and the server default.
export async function models(client: JsBaoClient) {
  // #region example
  const { models, defaultModel } = await client.llm.models();
  // #endregion example
  return { models, defaultModel };
}
