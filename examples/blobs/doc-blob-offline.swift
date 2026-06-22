import Foundation
import JsBaoClient

// Work with document blobs offline: queue an upload while offline, read cached
// bytes, warm the cache with prefetch, and resume the queue when back online.
func workOffline(
  client: JsBaoClient,
  documentId: String,
  data: Data,
  blobIds: [String]
) async throws {
  let blobs = client.documents.blobs(documentId: documentId)
  // #region example
  client.setNetworkMode(.offline)

  // Bytes are written to the local cache immediately and queued. upload()
  // resolves without waiting for the network (bytesTransferred is 0).
  let result = try await blobs.upload(
    data: data,
    options: BlobUploadSourceOptions(filename: "draft.txt", contentType: "text/plain")
  )

  // Reads served from cache for blobs uploaded or downloaded on this device.
  let text = try await blobs.read(blobId: result.blobId, as: String.self)

  // Warm the cache; per-blob errors are logged and swallowed.
  await blobs.prefetch(blobIds: blobIds, concurrency: 4)

  // Queue processing resumes automatically; listen for .blobsQueueDrained.
  client.setNetworkMode(.online)
  // #endregion example
  _ = text
}
