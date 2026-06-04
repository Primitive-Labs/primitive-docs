import JsBaoClient

// Swift-only. Returns a typed `[PromptInfo]`. NOTE: this calls an app-api route
// that does not exist (#993), so it returns a 404 at runtime. No JS equivalent.
func list(client: JsBaoClient) async throws {
  // #region example
  let prompts: [PromptInfo] = try await client.prompts.list()
  // #endregion example
  _ = prompts
}
