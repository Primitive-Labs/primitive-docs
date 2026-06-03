import JsBaoClient

// Delete a bucket and every blob inside it. Swift returns an untyped
// `[String: Any]` rather than the JS `{ deleted: boolean }` shape.
func deleteBucket(client: JsBaoClient, bucketIdOrKey: String) async throws {
  // #region example
  let result = try await client.blobBuckets.deleteBucket(bucketIdOrKey: bucketIdOrKey)
  let deleted = result["deleted"] as? Bool ?? false
  // #endregion example
  _ = deleted
}
