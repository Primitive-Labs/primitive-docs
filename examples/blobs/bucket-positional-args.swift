import Foundation
import JsBaoClient

// The bucket API is flat: there is no bucket() context object. The bucket
// key (or id) is always the leading argument to each method.
func bucketPositionalArgs(
  client: JsBaoClient,
  blobId: String,
  filename: String,
  contentType: String,
  data: Data
) async throws {
  // #region example
  // The bucket key/ID is a positional arg — there is no bucket() context object.
  try await client.blobBuckets.upload(
    bucketIdOrKey: "avatars", data: data, filename: filename, contentType: contentType
  )
  try await client.blobBuckets.getSignedUrl(
    bucketIdOrKey: "avatars", blobId: blobId, expiresInSeconds: 3600
  )
  // #endregion example
}
