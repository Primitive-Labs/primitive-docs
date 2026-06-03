import type { JsBaoClient } from "js-bao-wss-client";

// There is no `triggerSource` filter on listRuns. Cron-fired runs are
// identifiable by their contextDocId starting with "cron:" (and meta.source).
export async function listCronRuns(client: JsBaoClient) {
  // #region example
  const { items } = await client.workflows.listRuns({ workflowKey: "send-digest" });
  const cronRuns = items.filter((r) => r.contextDocId?.startsWith("cron:"));
  // #endregion example
  return cronRuns;
}
