import JsBaoClient

// Create a new blob bucket (admin/owner only). Swift takes a typed
// `CreateBlobBucketParams` with closed `ttlTier` / `accessPolicy` enums and
// returns a `BlobBucketInfo`.
func createBucket(client: JsBaoClient, bucketKey: String) async throws {
  // #region example
  let bucket = try await client.blobBuckets.createBucket(params: CreateBlobBucketParams(
    bucketKey: bucketKey,
    name: "User avatars",
    ttlTier: .permanent,
    accessPolicy: .publicRead,
    description: "Profile images uploaded by members"
  ))
  // #endregion example
  _ = bucket
}
