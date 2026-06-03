import Foundation
import JsBaoClient

// Update the signed-in user's profile. Swift takes an untyped `[String: Any]`
// (JS uses a typed `UpdateMeParams`). Use `NSNull()` for `avatarUrl` to clear it.
func update(client: JsBaoClient, name: String) async throws {
  // #region example
  let profile = try await client.me.update(params: [
    "name": name,
    "avatarUrl": NSNull(),
  ])
  // #endregion example
  _ = profile
}
