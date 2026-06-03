import type { JsBaoClient } from "js-bao-wss-client";

// Verify a magic-link token and sign the user in. `inviteToken` resolves
// deferred grants for invite-only signups.
export async function magicLinkVerify(
  client: JsBaoClient,
  token: string,
  inviteToken: string,
) {
  // #region example
  const { user, isNewUser, promptAddPasskey } = await client.magicLinkVerify(
    token,
    { inviteToken },
  );
  // #endregion example
  return { user, isNewUser, promptAddPasskey };
}
