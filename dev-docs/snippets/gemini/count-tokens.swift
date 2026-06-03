import JsBaoClient

// Count the tokens in a prompt without generating a response. Swift takes an
// untyped `[String: Any]` and returns an untyped dictionary.
func countTokens(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.gemini.countTokens(options: [
    "model": "gemini-1.5-pro",
    "messages": [
      ["role": "user", "parts": [["type": "text", "text": "How many tokens is this?"]]],
    ],
  ])
  let totalTokens = result["totalTokens"] as? Int
  // #endregion example
  _ = totalTokens
}
