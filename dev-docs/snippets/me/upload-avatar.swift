import Foundation
import JsBaoClient

// Upload an avatar image and read back the new URL. Swift takes raw `Data` plus
// a bare-`String` `contentType` (JS uses a typed 4-case MIME union) and returns
// an untyped dictionary.
func uploadAvatar(client: JsBaoClient, image: Data) async throws {
  // #region example
  let result = try await client.me.uploadAvatar(imageData: image, contentType: "image/png")
  let avatarUrl = result["avatarUrl"] as? String
  // #endregion example
  _ = avatarUrl
}
