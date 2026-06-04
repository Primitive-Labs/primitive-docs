import Foundation
import JsBaoClient

// Upload a blob into a bucket. Swift narrows the body to `Data` (vs JS's
// ArrayBuffer | Uint8Array | Blob | string) by design, takes the options as
// labeled args, and returns a typed `BucketBlobInfo` (read `blob.blobId`).
func upload(
  client: JsBaoClient,
  bucketIdOrKey: String,
  data: Data
) async throws {
  // #region example
  let blob = try await client.blobBuckets.upload(
    bucketIdOrKey: bucketIdOrKey,
    data: data,
    filename: "avatar.png",
    contentType: "image/png",
    tags: ["avatar", "profile"]
  )
  // #endregion example
  _ = blob
}
