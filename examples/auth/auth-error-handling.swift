import JsBaoClient

// AuthError is thrown for non-2xx auth responses. It carries an optional
// `code: AuthCode?` enum — switch on `error.code`.
func verifyWithErrorHandling(
  client: JsBaoClient,
  email: String,
  code: String,
  showUserMessage: (String) -> Void
) async throws {
  // #region example
  do {
    _ = try await client.auth.otpVerify(email: email, code: code)
  } catch let error as AuthError {
    switch error.code {
    case .invalidToken,          // bad/expired code
         .tokenExpired,          // token expired
         .invitationRequired,    // invite-only app, no invitation
         .domainNotAllowed,      // domain-mode app, email not in allowed domains
         .addedToWaitlist,       // waitlist enabled, user added
         .waitlistEntryUpdated,  // existing waitlist entry updated
         .magicLinkNotEnabled,   // magic link off in admin console
         .inviteTokenInvalid,    // bad invite token
         .inviteTokenExpired,    // invite token expired
         .inviteAlreadyAccepted: // invite already used
      showUserMessage(error.message)
    default:
      throw error
    }
  }
  // #endregion example
}
