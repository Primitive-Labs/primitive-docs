import JsBaoClient

// Delete a bucket and every blob inside it. Swift returns a typed
// `BlobDeletedResult` mirroring the JS `{ deleted: boolean }` shape.
func deleteBucket(client: JsBaoClient, bucketIdOrKey: String) async throws {
  // #region example
  let result = try await client.blobBuckets.deleteBucket(bucketIdOrKey: bucketIdOrKey)
  let deleted = result.deleted
  // #endregion example
  _ = deleted
}
