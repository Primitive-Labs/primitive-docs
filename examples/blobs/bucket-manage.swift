import JsBaoClient

// List, inspect, and delete blobs in a bucket.
func manageBucket(client: JsBaoClient, blobId: String) async throws {
  // #region example
  // List blobs in the bucket
  let page = try await client.blobBuckets.list(bucketIdOrKey: "avatars", limit: 50)
  let items = page.items
  let cursor = page.cursor

  // One blob's metadata
  let meta = try await client.blobBuckets.getMetadata(bucketIdOrKey: "avatars", blobId: blobId)

  // Delete a blob
  _ = try await client.blobBuckets.delete(bucketIdOrKey: "avatars", blobId: blobId)
  // #endregion example
  _ = (items, cursor, meta)
}
