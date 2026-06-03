import JsBaoClient

// Fires when a queued blob upload fails (may still retry).
func blobsUploadFailed(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.blobsUploadFailed) { (event: BlobUploadFailedEvent) in
    // Swift renames JS `lastError?` -> non-optional `error` and drops several fields.
    print("failed", event.blobId, event.error, "retry:", event.willRetry)
  }
  // #endregion example
  _ = sub
}
