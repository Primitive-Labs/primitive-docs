import Foundation
import JsBaoClient

// Read and mutate the current signed-in user via the `client.me` namespace.
func manageMyProfile(client: JsBaoClient, avatar: Data) async throws {
  // #region example
  // Current profile (cache-backed). Nil when signed out.
  let profile = try await client.me.get(
    options: FetchCachedOptions(
      waitForLoad: .localIfAvailableElseNetwork,  // | .local | .network
      refreshNetwork: true,  // bypass the cache once
      refreshIfOlderThanMs: 60_000,  // default is 5 minutes
      serverTimeoutMs: 5_000
    )
  )

  // Update name and/or avatar (pass .clear to remove the avatar).
  _ = try await client.me.update(
    params: UpdateMeParams(
      name: "Alice Reyes",
      avatarUrl: .value("https://cdn.example.com/u/alice.png")
    )
  )

  // Upload an image directly; the server hosts it and returns a URL.
  let uploaded = try await client.me.uploadAvatar(imageData: avatar, contentType: .png)
  let avatarUrl = uploaded.avatarUrl

  // update() and uploadAvatar() clear the cache automatically; reach for
  // these only when you need to inspect or force a refresh yourself.
  let info = await client.me.cacheInfo()  // MeCacheInfo(updatedAt?, ageMs?)
  await client.me.clearCache()  // next get() hits the network
  // #endregion example
  _ = (profile, avatarUrl, info)
}
