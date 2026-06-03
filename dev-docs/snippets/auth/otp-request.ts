import type { JsBaoClient } from "js-bao-wss-client";

// Email a one-time password (OTP) code to the user.
export async function otpRequest(client: JsBaoClient, email: string) {
  // #region example
  const { success } = await client.otpRequest(email);
  // #endregion example
  return success;
}
