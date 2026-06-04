import JsBaoClient

// Update the signed-in user's profile, returning the updated `UserProfile`.
// Pass `avatarUrl: .clear` to remove the current avatar (JS `avatarUrl: null`).
func update(client: JsBaoClient, name: String) async throws {
  // #region example
  let profile = try await client.me.update(params: UpdateMeParams(
    name: name,
    avatarUrl: .clear
  ))
  // #endregion example
  _ = profile
}
