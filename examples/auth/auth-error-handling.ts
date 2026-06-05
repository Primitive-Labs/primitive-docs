import { AuthError, AUTH_CODES, type JsBaoClient } from "js-bao-wss-client";

// AuthError is thrown for non-2xx auth responses with a machine-readable
// code. Switch on the exported AUTH_CODES constants; compare server-only
// codes as string literals.
export async function verifyWithErrorHandling(
  client: JsBaoClient,
  email: string,
  code: string,
  showUserMessage: (message: string) => void
) {
  // #region example
  try {
    await client.otpVerify(email, code);
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.code) {
        case AUTH_CODES.INVALID_TOKEN:          // bad/expired code
        case AUTH_CODES.TOKEN_EXPIRED:          // token expired
        case AUTH_CODES.INVITATION_REQUIRED:    // invite-only app, no invitation
        case AUTH_CODES.DOMAIN_NOT_ALLOWED:     // domain-mode app, email not in allowed domains
        case AUTH_CODES.ADDED_TO_WAITLIST:      // waitlist enabled, user added
        case AUTH_CODES.WAITLIST_ENTRY_UPDATED: // existing waitlist entry updated
        case AUTH_CODES.PASSKEY_NOT_ENABLED:    // passkey off in admin console
        case AUTH_CODES.MAGIC_LINK_NOT_ENABLED: // magic link off in admin console
        case AUTH_CODES.INVITE_TOKEN_INVALID:   // bad invite token
        case AUTH_CODES.INVITE_TOKEN_EXPIRED:   // invite token expired
        case AUTH_CODES.INVITE_ALREADY_ACCEPTED: // invite already used
          showUserMessage(err.message);
          return;
      }
      // Server-only codes — not in the client's AUTH_CODES constant, so check
      // the string directly:
      switch (err.code) {
        case "RATE_LIMITED":             // too many requests; err may include retryAfter
        case "OTP_MAX_ATTEMPTS":         // too many bad guesses; request new code
        case "OTP_NOT_ENABLED":          // OTP off in admin console
        case "RESERVED_EMAIL_FOR_ADMIN": // +primitivetest emails can't hold admin/owner roles
          showUserMessage(err.message);
          return;
      }
    }
    throw err;
  }
  // #endregion example
}
