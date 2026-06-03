import type { JsBaoClient } from "js-bao-wss-client";

// List available Gemini models and the server default.
export async function models(client: JsBaoClient) {
  // #region example
  const { models, defaultModel } = await client.gemini.models();
  // #endregion example
  return { models, defaultModel };
}
