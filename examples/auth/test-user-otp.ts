import type { JsBaoClient } from "js-bao-wss-client";

// Sign in a `+primitivetest` account in an integration test using the magic
// OTP code. The derived account must already exist as a user in the app.
export async function signInTestUser(client: JsBaoClient) {
  // #region example
  // Requires the app owner to have added "alice@example.com" to the app's
  // testAccountBaseEmails whitelist. Then any `alice+primitivetest<suffix>@example.com`
  // derivative becomes a test account that accepts code "000000".
  await client.otpRequest("alice+primitivetest@example.com");
  await client.otpVerify("alice+primitivetest@example.com", "000000");
  // client is now authenticated; the access token expires in 30 minutes

  // Role-distinguished derivatives (Gmail/Workspace deliver them to the same inbox):
  await client.otpRequest("alice+primitivetest-teacher@example.com");
  // #endregion example
}
