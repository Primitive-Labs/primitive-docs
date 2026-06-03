import Foundation
import JsBaoClient

// Fetch from an HTTP endpoint with automatic caching keyed on the request.
func fetchHttp(client: JsBaoClient) async throws {
  // #region example
  let posts: [[String: Any]]? = try await client.cache.fetchHttp(
    method: "GET",
    path: "/api/posts",
    query: ["page": 1, "sort": "recent"],
    options: FetchCachedOptions(serverTimeoutMs: 5_000)
  )
  // #endregion example
  _ = posts
}
