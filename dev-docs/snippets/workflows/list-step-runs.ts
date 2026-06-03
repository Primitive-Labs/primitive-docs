import type { JsBaoClient } from "js-bao-wss-client";

// List the per-step records for one run (debugging: input/output/error/timing).
export async function listStepRuns(client: JsBaoClient, runId: string) {
  // #region example
  const steps = await client.workflows.listStepRuns({ runId });
  // steps.items: WorkflowStepRunRecord[]
  // #endregion example
  return steps;
}
