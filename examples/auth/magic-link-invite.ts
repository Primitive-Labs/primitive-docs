import type { JsBaoClient } from "js-bao-wss-client";

// Accept an invitation server-side at magic-link verify time, so the deferred
// grant resolves to the signing-in user even when the invited email differs.
export async function magicLinkVerifyWithInvite(
  client: JsBaoClient,
  magicToken: string,
  inviteTokenFromUrl: string,
) {
  // #region example
  const { user, isNewUser } = await client.magicLinkVerify(magicToken, {
    inviteToken: inviteTokenFromUrl,
  });
  // #endregion example
  return { user, isNewUser };
}
