import type { JsBaoClient } from "js-bao-wss-client";

// Start a workflow from app code, check its status, and list recent runs.
export async function startWorkflow(client: JsBaoClient) {
  // #region example
  // Start a workflow; it runs in the background
  const { runId, runKey } = await client.workflows.start({
    workflowKey: "welcome-email",
    input: { userName: "Alice", userEmail: "alice@example.com" },
  });

  // Check status
  const status = await client.workflows.getStatus({ workflowKey: "welcome-email", runKey });

  // List recent runs
  const { items } = await client.workflows.listRuns({ workflowKey: "welcome-email", limit: 50 });
  // #endregion example
  return { runId, status, items };
}
