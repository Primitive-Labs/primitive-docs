import JsBaoClient

// Send a raw request body to a Gemini model, bypassing structured formatting.
// `model` and `body` are required; missing/invalid args throw `INVALID_ARGUMENT`
// on Swift (JS throws `GEMINI_ERROR`).
func generateRaw(client: JsBaoClient) async throws {
  // #region example
  let raw = try await client.gemini.generateRaw(options: GeminiGenerateRawOptions(
    model: "gemini-1.5-pro",
    body: [
      "contents": [["role": "user", "parts": [["text": "Ping"]]]],
    ],
    query: ["alt": "json"]
  ))
  // #endregion example
  _ = raw
}
