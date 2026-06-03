import JsBaoClient

// Swift-only. NOTE: this calls an app-api route that does not exist, so it
// returns a 404 at runtime. There is no JS equivalent.
func get(client: JsBaoClient, promptKey: String) async throws {
  // #region example
  let prompt = try await client.prompts.get(promptKey: promptKey)
  // #endregion example
  _ = prompt
}
