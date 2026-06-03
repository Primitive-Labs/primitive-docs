import JsBaoClient

// Fires when a queued blob upload finishes successfully.
func blobsUploadCompleted(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.blobsUploadCompleted) { (event: BlobUploadCompletedEvent) in
    // Swift drops JS's queueId/filename/contentType/attempts/retainLocal/updatedAt.
    print("uploaded", event.blobId, "\(event.numBytes) bytes")
  }
  // #endregion example
  _ = sub
}
