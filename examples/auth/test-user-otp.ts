import type { JsBaoClient } from "js-bao-wss-client";

// Sign in a `+primitivetest` account in an integration test using the magic
// OTP code. The derived account must already exist as a user in the app.
export async function signInTestUser(client: JsBaoClient) {
  // #region example
  await client.otpRequest("alice+primitivetest-teacher@example.com");
  await client.otpVerify("alice+primitivetest-teacher@example.com", "000000");
  // client is now authenticated; the access token expires in 30 minutes
  // #endregion example
}
