import Foundation
import JsBaoClient

// Start the OAuth flow. Swift returns the authorization `URL` to open in a
// browser/ASWebAuthenticationSession (vs JS's in-page redirect) and requires
// an explicit `redirectUri`. No `inviteToken` / `waitlist` options.
func startOAuthFlow(client: JsBaoClient, redirectUri: String) async throws {
  // #region example
  let authUrl: URL = try await client.startOAuthFlow(
    redirectUri: redirectUri,
    continueUrl: "/home"
  )
  // #endregion example
  _ = authUrl
}
