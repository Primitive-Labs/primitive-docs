import JsBaoClient

// Delete a single blob from a bucket. Swift returns an untyped
// `[String: Any]` rather than the JS `{ deleted: boolean }` shape.
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
  let deleted = result["deleted"] as? Bool ?? false
  // #endregion example
  _ = deleted
}
