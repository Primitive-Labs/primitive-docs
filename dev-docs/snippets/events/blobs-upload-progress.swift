import JsBaoClient

// Fires repeatedly as a queued blob upload makes progress.
func blobsUploadProgress(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.blobsUploadProgress) { (event: BlobUploadProgressEvent) in
    // Swift exposes a 4-field byte-progress view; JS sends the full queue item.
    print(event.blobId, "\(event.bytesTransferred)/\(event.totalBytes)")
  }
  // #endregion example
  _ = sub
}
