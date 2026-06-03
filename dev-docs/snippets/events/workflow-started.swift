import JsBaoClient

// Fires when a workflow run starts.
func workflowStarted(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.workflowStarted) { (event: WorkflowStartedEvent) in
    // Swift carries only workflowKey + runId; JS also has workflowId/runKey/instanceId/contextDocId/meta.
    print("started", event.workflowKey, event.runId)
  }
  // #endregion example
  _ = sub
}
