import JsBaoClient

// Create a new blob bucket (admin/owner only). The Swift client takes an
// untyped `[String: Any]` and returns a `[String: Any]` dictionary, so the
// TTL-tier / access-policy values are plain strings (no enum check).
func createBucket(client: JsBaoClient, bucketKey: String) async throws {
  // #region example
  let bucket = try await client.blobBuckets.createBucket(params: [
    "bucketKey": bucketKey,
    "name": "User avatars",
    "description": "Profile images uploaded by members",
    "ttlTier": "permanent",
    "accessPolicy": "public-read",
  ])
  // #endregion example
  _ = bucket
}
