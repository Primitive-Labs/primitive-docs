import type { JsBaoClient } from "js-bao-wss-client";

// Delete a bucket and every blob inside it. Resolves to `{ deleted: boolean }`.
export async function deleteBucket(client: JsBaoClient, bucketIdOrKey: string) {
  // #region example
  const { deleted } = await client.blobBuckets.deleteBucket(bucketIdOrKey);
  // #endregion example
  return deleted;
}
