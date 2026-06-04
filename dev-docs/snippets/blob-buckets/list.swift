import JsBaoClient

// List blobs in a bucket. Swift takes labeled `cursor`/`limit` args and
// returns a typed `BucketBlobListResult` — `items` is `[BucketBlobInfo]` and
// `cursor` is `String?`.
func list(client: JsBaoClient, bucketIdOrKey: String) async throws {
  // #region example
  let page = try await client.blobBuckets.list(
    bucketIdOrKey: bucketIdOrKey,
    limit: 50
  )
  let items = page.items
  let nextCursor = page.cursor
  // #endregion example
  _ = (items, nextCursor)
}
