import JsBaoClient

// Delete a single blob from a bucket. Swift returns a typed
// `BlobDeletedResult` mirroring the JS `{ deleted: boolean }` shape.
func deleteBlob(
  client: JsBaoClient,
  bucketIdOrKey: String,
  blobId: String
) async throws {
  // #region example
  let result = try await client.blobBuckets.delete(
    bucketIdOrKey: bucketIdOrKey,
    blobId: blobId
  )
  let deleted = result.deleted
  // #endregion example
  _ = deleted
}
