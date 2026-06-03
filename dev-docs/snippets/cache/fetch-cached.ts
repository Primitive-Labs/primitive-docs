import type { JsBaoClient } from "js-bao-wss-client";

// Return a cached value if present, otherwise run the fetcher and cache it.
export async function fetchCached(client: JsBaoClient) {
  // #region example
  const profile = await client.cache.fetchCached(
    "user-profile",
    async () => {
      const res = await fetch("https://api.example.com/me");
      return res.json();
    },
    { refreshIfOlderThanMs: 60_000 },
  );
  // #endregion example
  return profile;
}
