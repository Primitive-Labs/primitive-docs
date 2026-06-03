import type { JsBaoClient } from "js-bao-wss-client";

// Send a structured prompt to Gemini and return the generated response.
export async function generate(client: JsBaoClient) {
  // #region example
  const result = await client.gemini.generate({
    model: "gemini-1.5-pro",
    system: [{ type: "text", text: "You are a concise assistant." }],
    messages: [
      { role: "user", parts: [{ type: "text", text: "Summarize photosynthesis." }] },
    ],
    generationConfig: { temperature: 0.4, maxOutputTokens: 256 },
  });
  // #endregion example
  return result;
}
