import JsBaoClient

// Fires when a queued blob upload fails (may still retry).
func blobsUploadFailed(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.blobsUploadFailed) { (event: BlobUploadFailedEvent) in
    // Full record matching JS: lastError? / attempts / nextAttemptAt / willRetry / …
    print("failed", event.blobId, event.lastError ?? "", "retry:", event.willRetry)
  }
  // #endregion example
  _ = sub
}
