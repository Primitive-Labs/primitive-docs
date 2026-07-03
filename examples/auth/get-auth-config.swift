import JsBaoClient

// Discover which auth methods are enabled before rendering any login UI.
func discoverAuthMethods(client: JsBaoClient) async throws {
  // #region example
  let config = try await client.auth.getAuthConfig()
  // AuthConfigInfo: appId, name, mode, waitlistEnabled,
  //   googleOAuthEnabled, googleClientId, hasOAuth, redirectUris,
  //   passkeyEnabled, passkeyRpId, passkeyRpName, passkeyRpConfig, hasPasskey,
  //   appleSignInEnabled, hasApple, magicLinkEnabled, otpEnabled

  let methods = (
    google: config.hasOAuth,
    apple: config.hasApple,
    magicLink: config.magicLinkEnabled,
    otp: config.otpEnabled,
    passkey: config.hasPasskey
  )
  // #endregion example
  _ = methods
}
