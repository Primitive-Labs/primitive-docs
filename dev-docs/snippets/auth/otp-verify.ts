import type { JsBaoClient } from "js-bao-wss-client";

// Verify an OTP code and sign the user in. `inviteToken` resolves deferred
// grants for invite-only signups.
export async function otpVerify(
  client: JsBaoClient,
  email: string,
  code: string,
  inviteToken: string,
) {
  // #region example
  const { user, isNewUser } = await client.otpVerify(email, code, {
    inviteToken,
  });
  // #endregion example
  return { user, isNewUser };
}
