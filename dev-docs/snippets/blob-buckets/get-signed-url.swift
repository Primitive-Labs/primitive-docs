import JsBaoClient

// Mint a time-limited signed URL that downloads a blob without auth.
// Swift returns a typed `BlobSignedUrlResult` — read `signed.url`,
// `signed.token`, `signed.expiresAt`, `signed.expiresInSeconds`.
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
  let url = signed.url
  // #endregion example
  _ = url
}
