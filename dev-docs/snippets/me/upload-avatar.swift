import Foundation
import JsBaoClient

// Upload an avatar image and read back the new URL. Swift takes raw `Data` plus
// a typed `AvatarContentType` enum (`.png` / `.jpeg` / `.gif` / `.webp`) and
// returns a typed `AvatarUploadResult`.
func uploadAvatar(client: JsBaoClient, image: Data) async throws {
  // #region example
  let result = try await client.me.uploadAvatar(imageData: image, contentType: .png)
  let avatarUrl = result.avatarUrl
  // #endregion example
  _ = avatarUrl
}
