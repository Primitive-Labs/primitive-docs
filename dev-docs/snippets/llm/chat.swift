import JsBaoClient

// Send a chat completion request to the configured LLM provider. Swift takes an
// untyped `[String: Any]` — there is no typed `LlmChatOptions`, and the
// `attachments`/`reasoning` unions are plain dictionaries. Returns a dictionary.
func chat(client: JsBaoClient) async throws {
  // #region example
  let reply = try await client.llm.chat(options: [
    "model": "gpt-4o",
    "messages": [
      ["role": "system", "content": "You are a helpful assistant."],
      ["role": "user", "content": "What's in this image?"],
    ],
    "attachments": [
      ["type": "image", "mime": "image/png", "url": "https://example.com/cat.png"],
    ],
    "temperature": 0.7,
    "max_tokens": 512,
    "reasoning": ["effort": "medium"],
  ])
  let content = reply["content"]
  // #endregion example
  _ = (reply, content)
}
