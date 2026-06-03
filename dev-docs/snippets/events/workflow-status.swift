import JsBaoClient

// Fires when a workflow run reaches a terminal status (completed/failed/terminated).
func workflowStatus(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.workflowStatus) { (event: WorkflowStatusEvent) in
    print(event.workflowKey, "->", event.status)
  }
  // #endregion example
  _ = sub
}
