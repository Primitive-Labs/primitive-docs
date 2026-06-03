import type { JsBaoClient } from "js-bao-wss-client";

// List runs for the current user, optionally filtered and paginated.
export async function listRuns(client: JsBaoClient, workflowKey: string) {
  // #region example
  const page = await client.workflows.listRuns({
    workflowKey,
    status: "completed",
    limit: 20,
  });
  // page.items: WorkflowRun[]  /  page.cursor for the next page
  // #endregion example
  return page;
}
