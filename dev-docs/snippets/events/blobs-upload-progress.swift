import JsBaoClient

// Fires repeatedly as a queued blob upload makes progress.
func blobsUploadProgress(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.blobsUploadProgress) { (event: BlobUploadProgressEvent) in
    // Full queue-item record, matching JS (queueId/filename/contentType/numBytes/status/attempts/…).
    print(event.blobId, event.filename, "\(event.numBytes) bytes, status \(event.status)")
  }
  // #endregion example
  _ = sub
}
