import type { JsBaoClient } from "js-bao-wss-client";

// Run a syncCallable workflow and await its terminal result in one round-trip.
export async function validateCoupon(client: JsBaoClient, code: string) {
  // #region example
  const result = await client.workflows.runSync({
    workflowKey: "validate-coupon",
    input: { code },
    timeoutMs: 5000, // default 5000; server caps at 30000
  });
  // → { runId, runKey, status, output?, error?, run?, existing? }
  // status: "completed" | "failed" | "terminated" | "timeout" | "apply_pending"
  // Resolves for every terminal outcome — only transport errors reject.
  if (result.status === "completed") {
    console.log(result.output);
  }
  // #endregion example
  return result;
}
