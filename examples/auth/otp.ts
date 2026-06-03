import type { JsBaoClient } from "js-bao-wss-client";

// Email one-time code: request a 6-digit code, then verify it.
export async function otpFlow(
  client: JsBaoClient,
  email: string,
  code: string,
) {
  // #region example
  await client.otpRequest(email);

  // User enters the 6-digit code from the email.
  const { user, isNewUser } = await client.otpVerify(email, code);
  // Token is now stored on the client and the WS auto-connects.
  // #endregion example
  return { user, isNewUser };
}
