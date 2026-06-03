import type { JsBaoClient } from "js-bao-wss-client";

// Inspect the per-step debug records for a single workflow run.
export async function listWorkflowStepRuns(client: JsBaoClient, runId: string) {
  // #region example
  // Fetch the per-step run records for a run (debugging / admin views)
  const { items: stepRuns } = await client.workflows.listStepRuns({ runId });

  for (const step of stepRuns) {
    // step.stepId, step.stepKind, step.status, step.input, step.output, step.error
    console.log(step.stepId, step.stepKind, step.status);
  }
  // #endregion example
  return stepRuns;
}
