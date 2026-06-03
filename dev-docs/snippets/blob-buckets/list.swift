import JsBaoClient

// List blobs in a bucket. Swift flattens the options into positional
// `cursor`/`limit` args and returns an untyped `[String: Any]` (no
// `BucketBlobListResult`), so `items` / `cursor` are dug out by key.
func list(client: JsBaoClient, bucketIdOrKey: String) async throws {
  // #region example
  let page = try await client.blobBuckets.list(
    bucketIdOrKey: bucketIdOrKey,
    limit: 50
  )
  let items = page["items"] as? [[String: Any]] ?? []
  let nextCursor = page["cursor"] as? String
  // #endregion example
  _ = (items, nextCursor)
}
