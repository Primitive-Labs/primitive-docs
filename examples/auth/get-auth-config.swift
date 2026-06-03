import JsBaoClient

// Discover which auth methods are enabled before rendering any login UI.
// On Swift `getAuthConfig()` returns the raw `[String: Any]` envelope.
func discoverAuthMethods(client: JsBaoClient) async throws {
  // #region example
  let config = try await client.getAuthConfig()
  // keys: appId, name, mode, waitlistEnabled,
  //   googleOAuthEnabled, googleClientId, hasOAuth, redirectUris,
  //   passkeyEnabled, passkeyRpId, passkeyRpName, hasPasskey,
  //   magicLinkEnabled, otpEnabled

  let methods = (
    google: config["hasOAuth"] as? Bool ?? false,
    magicLink: config["magicLinkEnabled"] as? Bool ?? false,
    otp: config["otpEnabled"] as? Bool ?? false,
    passkey: config["hasPasskey"] as? Bool ?? false
  )
  // #endregion example
  _ = methods
}
