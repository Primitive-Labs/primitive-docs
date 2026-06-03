import type { JsBaoClient } from "js-bao-wss-client";

// Send a raw request body to a Gemini model, bypassing structured formatting.
export async function generateRaw(client: JsBaoClient) {
  // #region example
  const raw = await client.gemini.generateRaw({
    model: "gemini-1.5-pro",
    body: {
      contents: [{ role: "user", parts: [{ text: "Ping" }] }],
    },
    query: { alt: "json" },
  });
  // #endregion example
  return raw;
}
