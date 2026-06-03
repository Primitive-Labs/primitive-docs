import type { JsBaoClient } from "js-bao-wss-client";

// Read and mutate the current signed-in user via the `client.me` namespace.
export async function manageMyProfile(client: JsBaoClient, avatar: File) {
  // #region example
  // Current profile (cache-backed). Null when signed out.
  const profile = await client.me.get({
    waitForLoad: "localIfAvailableElseNetwork", // | "local" | "network"
    refreshIfOlderThanMs: 60_000, // default is 5 minutes
    refreshNetwork: true, // bypass the cache once
    serverTimeoutMs: 5_000,
  });

  // Update name and/or avatar (pass null to clear the avatar).
  await client.me.update({
    name: "Alice Reyes",
    avatarUrl: "https://cdn.example.com/u/alice.png",
  });

  // Upload an image directly; the server hosts it and returns a URL.
  const { avatarUrl } = await client.me.uploadAvatar(avatar, "image/png");

  // update() and uploadAvatar() clear the cache automatically; reach for
  // these only when you need to inspect or force a refresh yourself.
  const info = await client.me.cacheInfo(); // { updatedAt?, ageMs? }
  await client.me.clearCache(); // next get() hits the network
  // #endregion example
  return { profile, avatarUrl, info };
}
