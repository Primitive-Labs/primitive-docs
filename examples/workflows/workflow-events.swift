import JsBaoClient

// React to workflow lifecycle events over the WebSocket, delivered as typed
// event structs. Hold the returned EventSubscription for as long as you want
// the handler live. Requires an active WebSocket (e.g. from
// client.documents.open(docId)).
func wireWorkflowEvents(client: JsBaoClient) -> [EventSubscription] {
  // #region example
  let started = client.events.on(.workflowStarted) { (e: WorkflowStartedEvent) in
    // e.workflowKey, e.runId, e.runKey?, e.instanceId?, e.contextDocId?, e.meta?
  }

  let status = client.events.on(.workflowStatus) { (e: WorkflowStatusEvent) in
    // e.status: "completed" | "failed" | "terminated"
    // e.needsApply == true if requiresClientApply and not yet applied
    // also: e.runKey, e.runId, e.output, e.error, e.contextDocId, e.meta
  }
  // #endregion example
  return [started, status]
}
