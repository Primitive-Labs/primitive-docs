import Foundation
import JsBaoClient

// Upload an avatar image and read back the new URL. Swift takes raw `Data` plus
// a bare-`String` `contentType` (JS uses a typed 4-case MIME union) and returns
// a typed `AvatarUploadResult`.
func uploadAvatar(client: JsBaoClient, image: Data) async throws {
  // #region example
  let result = try await client.me.uploadAvatar(imageData: image, contentType: "image/png")
  let avatarUrl = result.avatarUrl
  // #endregion example
  _ = avatarUrl
}
