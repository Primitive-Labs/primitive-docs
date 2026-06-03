import JsBaoClient

// Send a structured prompt to Gemini and return the generated response.
func generate(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.gemini.generate(options: GeminiGenerateOptions(
    model: "gemini-1.5-pro",
    system: [.text("You are a concise assistant.")],
    messages: [
      GeminiMessage(role: .user, parts: [.text("Summarize photosynthesis.")]),
    ],
    generationConfig: GeminiGenerationConfig(temperature: 0.4, maxOutputTokens: 256)
  ))
  let message = result.message
  // #endregion example
  _ = (result, message)
}
