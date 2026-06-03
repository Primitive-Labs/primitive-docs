import JsBaoClient

// Count the tokens in a prompt without generating a response.
func countTokens(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.gemini.countTokens(options: GeminiPromptOptions(
    model: "gemini-1.5-pro",
    messages: [
      GeminiMessage(role: .user, parts: [.text("How many tokens is this?")]),
    ]
  ))
  let totalTokens = result.totalTokens
  // #endregion example
  _ = totalTokens
}
