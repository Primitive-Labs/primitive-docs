import JsBaoClient

// List, inspect, and delete blobs in a bucket.
func manageBucket(client: JsBaoClient, blobId: String, expiredIds: [String]) async throws {
  // #region example
  // List blobs in the bucket
  let page = try await client.blobBuckets.list(bucketIdOrKey: "avatars", limit: 50)
  let items = page.items
  let cursor = page.cursor

  // One blob's metadata
  let meta = try await client.blobBuckets.getMetadata(bucketIdOrKey: "avatars", blobId: blobId)

  // Delete a blob
  _ = try await client.blobBuckets.delete(bucketIdOrKey: "avatars", blobId: blobId)

  // Delete a batch of blobs (up to 500 ids) in one call
  let batchResult = try await client.blobBuckets.delete(bucketIdOrKey: "avatars", blobIds: expiredIds)
  // batchResult: BatchBlobDeleteResult { deleted, blobIds, bucketId }
  // #endregion example
  _ = (items, cursor, meta, batchResult)
}
