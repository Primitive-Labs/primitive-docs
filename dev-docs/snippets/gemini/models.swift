import JsBaoClient

// List available Gemini models and the server default. Swift returns an untyped
// `[String: Any]` envelope rather than JS's typed `{ models, defaultModel }`.
func models(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.gemini.models()
  let names = result["models"] as? [String] ?? []
  let defaultModel = result["defaultModel"] as? String
  // #endregion example
  _ = (names, defaultModel)
}
