import JsBaoClient

// List available Gemini models and the server default.
func models(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.gemini.models()
  let names = result.models
  let defaultModel = result.defaultModel
  // #endregion example
  _ = (names, defaultModel)
}
