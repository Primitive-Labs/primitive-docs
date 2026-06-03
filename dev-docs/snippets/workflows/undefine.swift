import JsBaoClient

// Drop a previously-registered apply handler for a workflow key.
func undefine(client: JsBaoClient, workflowKey: String) {
  // #region example
  client.workflows.undefine(workflowKey)
  // #endregion example
}
