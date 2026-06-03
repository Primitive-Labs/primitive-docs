import type { JsBaoClient } from "js-bao-wss-client";

// Claim the apply lease for a run parked in `apply_pending`. Returns
// { claimed: true } if this client won the lock.
export async function claimApply(
  client: JsBaoClient,
  workflowKey: string,
  runKey: string,
  contextDocId: string,
) {
  // #region example
  const claim = await client.workflows.claimApply({
    workflowKey,
    runKey,
    contextDocId,
  });
  if (claim.claimed) {
    // safe to read the output via getStatus and apply it, then confirmApply
  }
  // #endregion example
  return claim;
}
