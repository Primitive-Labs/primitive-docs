import JsBaoClient

// Read a blob's metadata without downloading the bytes. Swift returns an
// untyped `[String: Any]` rather than the typed `BlobInfo`.
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
