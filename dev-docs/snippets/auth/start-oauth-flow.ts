import type { JsBaoClient } from "js-bao-wss-client";

// Start the OAuth flow. In the browser this redirects to the provider;
// `inviteToken` / `waitlist` gate invite-only and waitlisted signups.
export async function startOAuthFlow(client: JsBaoClient, inviteToken: string) {
  // #region example
  await client.startOAuthFlow("/home", { inviteToken });
  // #endregion example
}
