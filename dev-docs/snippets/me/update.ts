import type { JsBaoClient } from "js-bao-wss-client";

// Update the signed-in user's profile. Pass `avatarUrl: null` to clear the avatar.
export async function update(client: JsBaoClient, name: string) {
  // #region example
  const profile = await client.me.update({ name, avatarUrl: null });
  // #endregion example
  return profile;
}
