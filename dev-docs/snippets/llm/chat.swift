import JsBaoClient

// Send a chat completion request to the configured LLM provider. `chat` now
// takes a typed `LlmChatOptions` — structured `messages`, an `attachments`
// union (image/audio/pdf), and `reasoning` — and returns a typed
// `LlmChatResponse`.
func chat(client: JsBaoClient) async throws {
  // #region example
  let reply = try await client.llm.chat(options: LlmChatOptions(
    model: "gpt-4o",
    messages: [
      ChatMessage(role: "system", text: "You are a helpful assistant."),
      ChatMessage(role: "user", text: "What's in this image?"),
    ],
    attachments: [
      .image(mime: "image/png", url: "https://example.com/cat.png"),
    ],
    temperature: 0.7,
    maxTokens: 512,
    reasoning: ReasoningOptions(effort: .medium)
  ))
  let content = reply.content
  // #endregion example
  _ = (reply, content)
}
