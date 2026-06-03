import type { JsBaoClient } from "js-bao-wss-client";

// Count the tokens in a prompt without generating a response.
export async function countTokens(client: JsBaoClient) {
  // #region example
  const { totalTokens } = await client.gemini.countTokens({
    model: "gemini-1.5-pro",
    messages: [
      { role: "user", parts: [{ type: "text", text: "How many tokens is this?" }] },
    ],
  });
  // #endregion example
  return totalTokens;
}
