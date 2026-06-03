import type { JsBaoClient } from "js-bao-wss-client";

// List every blob bucket for the current app (admin/owner only).
export async function listBuckets(client: JsBaoClient) {
  // #region example
  const buckets = await client.blobBuckets.listBuckets();
  // #endregion example
  return buckets;
}
