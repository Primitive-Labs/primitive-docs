import type { JsBaoClient } from "js-bao-wss-client";

// Confirm a claimed apply once the output has been written to the document.
// Transitions the run from `apply_claimed` to `completed`.
export async function confirmApply(
  client: JsBaoClient,
  workflowKey: string,
  runKey: string,
  contextDocId: string,
) {
  // #region example
  const result = await client.workflows.confirmApply({
    workflowKey,
    runKey,
    contextDocId,
  });
  // result.confirmed
  // #endregion example
  return result;
}
