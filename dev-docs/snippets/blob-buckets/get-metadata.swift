import JsBaoClient

// Read a blob's metadata without downloading the bytes. Swift returns a
// typed `BucketBlobInfo` (read `meta.numBytes`, `meta.sha256`, `meta.tags`, …).
func getMetadata(
  client: JsBaoClient,
  bucketIdOrKey: String,
  blobId: String
) async throws {
  // #region example
  let meta = try await client.blobBuckets.getMetadata(
    bucketIdOrKey: bucketIdOrKey,
    blobId: blobId
  )
  // #endregion example
  _ = meta
}
