import JsBaoClient

// Swift-only. Returns a typed `PromptInfo?`. NOTE: this calls an app-api route
// that does not exist (#993), so it returns a 404 at runtime. No JS equivalent.
func get(client: JsBaoClient, promptKey: String) async throws {
  // #region example
  let prompt: PromptInfo? = try await client.prompts.get(promptKey: promptKey)
  // #endregion example
  _ = prompt
}
