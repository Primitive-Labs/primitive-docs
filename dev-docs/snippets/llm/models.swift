import JsBaoClient

// List available LLM models and the server default. `models` now returns a
// typed `LlmModelsResponse` with `models` and `defaultModel`.
func models(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.llm.models()
  let names = result.models
  let defaultModel = result.defaultModel
  // #endregion example
  _ = (names, defaultModel)
}
