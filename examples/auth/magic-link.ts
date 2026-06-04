import type { JsBaoClient } from "js-bao-wss-client";

// Passwordless email link: request, then verify the token from the callback URL.
export async function magicLinkFlow(
  client: JsBaoClient,
  email: string,
  magicToken: string,
) {
  // #region example
  // Request the email. Requires oauthRedirectUri on the client, or pass
  // an explicit redirectUri here.
  await client.magicLinkRequest(email, {
    redirectUri: "https://app.example.com/auth/magic-callback",
  });

  // On the callback page, read ?magic_token=... and verify it.
  const { user, isNewUser, promptAddPasskey } =
    await client.magicLinkVerify(magicToken);
  // Token is now stored on the client and the WS auto-connects.
  // #endregion example
  return { user, isNewUser, promptAddPasskey };
}
