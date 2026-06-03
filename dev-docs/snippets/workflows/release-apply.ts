import type { JsBaoClient } from "js-bao-wss-client";

// Release a claimed apply so another client can retry. Call this if your
// apply handler fails after a successful claim.
export async function releaseApply(
  client: JsBaoClient,
  workflowKey: string,
  runKey: string,
  contextDocId: string,
) {
  // #region example
  const result = await client.workflows.releaseApply({
    workflowKey,
    runKey,
    contextDocId,
  });
  // result.released
  // #endregion example
  return result;
}
