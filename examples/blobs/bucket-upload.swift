import Foundation
import JsBaoClient

// Upload a blob into a bucket (referenced by key or id).
func uploadToBucket(client: JsBaoClient, data: Data) async throws {
  // #region example
  let result = try await client.blobBuckets.upload(
    bucketIdOrKey: "avatars",
    data: data,
    filename: "alice.jpg",
    contentType: "image/jpeg",
    tags: ["profile"]
  )
  let blobId = result["blobId"] as? String
  // #endregion example
  _ = blobId
}
