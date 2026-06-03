import JsBaoClient

// Mint a time-limited signed URL that downloads a blob without auth.
// Swift returns an untyped `[String: Any]` rather than `BlobSignedUrlResult`,
// so `url` / `token` / `expiresAt` are read out by key.
func getSignedUrl(
  client: JsBaoClient,
  bucketIdOrKey: String,
  blobId: String
) async throws {
  // #region example
  let signed = try await client.blobBuckets.getSignedUrl(
    bucketIdOrKey: bucketIdOrKey,
    blobId: blobId,
    expiresInSeconds: 3600
  )
  let url = signed["url"] as? String
  // #endregion example
  _ = url
}
