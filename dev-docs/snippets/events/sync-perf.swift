import JsBaoClient

// Fires with sync-timing telemetry for a document.
func syncPerf(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.syncPerf) { (event: SyncPerfEvent) in
    // Swift reports a single phase/elapsedMs pair; JS sends timings/clientTimings maps.
    print(event.documentId, event.phase, "\(event.elapsedMs)ms")
  }
  // #endregion example
  _ = sub
}
