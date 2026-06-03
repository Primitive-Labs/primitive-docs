import JsBaoClient

// Fetch one bucket by its bucketId or bucketKey.
// Swift returns an untyped `[String: Any]` rather than `BlobBucketInfo`.
func getBucket(client: JsBaoClient, bucketIdOrKey: String) async throws {
  // #region example
  let bucket = try await client.blobBuckets.getBucket(bucketIdOrKey: bucketIdOrKey)
  // #endregion example
  _ = bucket
}
