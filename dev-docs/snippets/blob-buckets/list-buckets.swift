import JsBaoClient

// List every blob bucket for the current app (admin/owner only).
// Swift returns `[BlobBucketInfo]` — each field is a typed property.
func listBuckets(client: JsBaoClient) async throws {
  // #region example
  let buckets = try await client.blobBuckets.listBuckets()
  // #endregion example
  _ = buckets
}
