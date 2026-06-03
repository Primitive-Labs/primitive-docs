import type { JsBaoClient } from "js-bao-wss-client";

// Email a magic sign-in link to the user.
export async function magicLinkRequest(client: JsBaoClient, email: string) {
  // #region example
  const { success } = await client.magicLinkRequest(email);
  // #endregion example
  return success;
}
