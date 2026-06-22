import JsBaoClient

// Accept an invitation server-side at magic-link verify time, so the deferred
// grant resolves to the signing-in user even when the invited email differs.
func magicLinkVerifyWithInvite(
  client: JsBaoClient,
  magicToken: String,
  inviteTokenFromUrl: String
) async throws {
  // #region example
  let result = try await client.auth.magicLinkVerify(
    token: magicToken,
    inviteToken: inviteTokenFromUrl
  )
  let user = result.user
  let isNewUser = result.isNewUser ?? false
  // #endregion example
  _ = (user, isNewUser)
}
