import type { JsBaoClient } from "js-bao-wss-client";

// Fetch runs awaiting client-side apply for a document. Useful on reconnect
// to recover applies whose events were missed while offline.
export async function getPendingApplies(client: JsBaoClient, contextDocId: string) {
  // #region example
  const pending = await client.workflows.getPendingApplies({ contextDocId });
  // pending: one entry per run still in apply_pending
  // #endregion example
  return pending;
}
