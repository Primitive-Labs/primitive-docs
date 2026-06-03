import type { JsBaoClient } from "js-bao-wss-client";

// Send a chat completion request to the configured LLM provider.
export async function chat(client: JsBaoClient) {
  // #region example
  const reply = await client.llm.chat({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What's in this image?" },
    ],
    attachments: [{ type: "image", mime: "image/png", url: "https://example.com/cat.png" }],
    temperature: 0.7,
    max_tokens: 512,
    reasoning: { effort: "medium" },
  });
  // #endregion example
  return reply;
}
