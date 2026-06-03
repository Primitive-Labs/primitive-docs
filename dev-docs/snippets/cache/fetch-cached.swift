import Foundation
import JsBaoClient

// Return a cached value if present, otherwise run the fetcher and cache it.
func fetchCached(client: JsBaoClient) async throws {
  // #region example
  let profile: [String: Any]? = try await client.cache.fetchCached(
    key: "user-profile",
    fetcher: {
      let (data, _) = try await URLSession.shared.data(from: URL(string: "https://api.example.com/me")!)
      return try JSONSerialization.jsonObject(with: data) as! [String: Any]
    },
    options: FetchCachedOptions(refreshIfOlderThanMs: 60_000)
  )
  // #endregion example
  _ = profile
}
