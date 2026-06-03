import JsBaoClient

// Read a bucket blob via a time-limited signed URL, or download the bytes.
func readFromBucket(client: JsBaoClient, blobId: String) async throws {
  // #region example
  // Signed URL (for <img> tags, etc.)
  let signed = try await client.blobBuckets.getSignedUrl(
    bucketIdOrKey: "avatars", blobId: blobId, expiresInSeconds: 3600
  )
  let url = signed["url"] as? String

  // Or download the bytes directly
  let bytes = try await client.blobBuckets.download(bucketIdOrKey: "avatars", blobId: blobId)
  // #endregion example
  _ = (url, bytes)
}
