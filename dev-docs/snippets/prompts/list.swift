import JsBaoClient

// Swift-only. NOTE: this calls an app-api route that does not exist, so it
// returns a 404 at runtime. There is no JS equivalent.
func list(client: JsBaoClient) async throws {
  // #region example
  let prompts = try await client.prompts.list()
  // #endregion example
  _ = prompts
}
