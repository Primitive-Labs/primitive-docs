import JsBaoClient

// Send a structured prompt to Gemini. Swift takes an untyped `[String: Any]`
// and returns an untyped dictionary; read fields with dict access.
func generate(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.gemini.generate(options: [
    "model": "gemini-1.5-pro",
    "system": [["type": "text", "text": "You are a concise assistant."]],
    "messages": [
      ["role": "user", "parts": [["type": "text", "text": "Summarize photosynthesis."]]],
    ],
    "generationConfig": ["temperature": 0.4, "maxOutputTokens": 256],
  ])
  let message = result["message"] as? [String: Any]
  // #endregion example
  _ = (result, message)
}
