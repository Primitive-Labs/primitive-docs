import Foundation
import JsBaoClient

// Magic-link callback: the token arrives as `magic_token` (not `token`,
// `magicToken`, or `code`). Read it off the redirect URI, verify it, then
// route by the result flags.
func handleMagicLinkCallback(
  client: JsBaoClient,
  callbackURL: URL,
  showOnboarding: () -> Void,
  offerPasskeyRegistration: () -> Void
) async throws {
  // #region example
  let magicToken = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)?
    .queryItems?.first(where: { $0.name == "magic_token" })?.value

  if let magicToken {
    let result = try await client.auth.magicLinkVerify(token: magicToken)
    // Token is now stored on the client and WS auto-connects.
    if result.isNewUser == true { showOnboarding() }
    if result.promptAddPasskey == true { offerPasskeyRegistration() }
  }
  // #endregion example
}
