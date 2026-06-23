import JsBaoClient

// Subscribe to the blob upload-queue lifecycle events, delivered as typed event
// structs on `client.events`. `blobsUploadProgress` fires on status transitions
// (not per-byte) — there is no per-byte progress callback.
func wireBlobEvents(client: JsBaoClient) -> [EventSubscription] {
  // #region example
  let progress = client.events.on(.blobsUploadProgress) { (e: BlobUploadProgressEvent) in
    print(e.queueId, e.blobId, e.status, e.numBytes, e.attempts)
  }

  let completed = client.events.on(.blobsUploadCompleted) { (e: BlobUploadCompletedEvent) in
    print("done", e.blobId, e.queueId)
  }

  let failed = client.events.on(.blobsUploadFailed) { (e: BlobUploadFailedEvent) in
    print("failed", e.blobId, e.lastError ?? "", "retry?", e.willRetry)
  }
  // #endregion example
  return [progress, completed, failed]
}
