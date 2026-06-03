import JsBaoClient

// Bucket administration (admin/owner only): create, list, get, and delete
// buckets. Deleting a bucket cascades to every blob inside it.
func adminBuckets(client: JsBaoClient) async throws {
  // #region example
  _ = try await client.blobBuckets.createBucket(params: [
    "bucketKey": "uploads",
    "name": "User uploads",
    "ttlTier": "28d",
    "accessPolicy": "authenticated",
  ])

  let buckets = try await client.blobBuckets.listBuckets()
  let bucket = try await client.blobBuckets.getBucket(bucketIdOrKey: "uploads")

  _ = try await client.blobBuckets.deleteBucket(bucketIdOrKey: "uploads")  // cascades to all blobs
  // #endregion example
  _ = (buckets, bucket)
}
