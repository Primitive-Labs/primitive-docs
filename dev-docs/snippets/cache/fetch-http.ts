import type { JsBaoClient } from "js-bao-wss-client";

// Fetch from an HTTP endpoint with automatic caching keyed on the request.
export async function fetchHttp(client: JsBaoClient) {
  // #region example
  const posts = await client.cache.fetchHttp(
    {
      method: "GET",
      path: "/api/posts",
      query: { page: 1, sort: "recent" },
    },
    { serverTimeoutMs: 5_000 },
  );
  // #endregion example
  return posts;
}
