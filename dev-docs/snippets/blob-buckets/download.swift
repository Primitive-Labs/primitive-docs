import Foundation
import JsBaoClient

// Download a blob's raw bytes. Swift returns `Data` (vs JS's ArrayBuffer).
func download(
  client: JsBaoClient,
  bucketIdOrKey: String,
  blobId: String
) async throws {
  // #region example
  let bytes = try await client.blobBuckets.download(
    bucketIdOrKey: bucketIdOrKey,
    blobId: blobId
  )
  // #endregion example
  _ = bytes
}
