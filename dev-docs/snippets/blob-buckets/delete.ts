import type { JsBaoClient } from "js-bao-wss-client";

// Delete a single blob from a bucket. Resolves to `{ deleted: boolean }`.
export async function deleteBlob(
  client: JsBaoClient,
  bucketIdOrKey: string,
  blobId: string,
) {
  // #region example
  const { deleted } = await client.blobBuckets.delete(bucketIdOrKey, blobId);
  // #endregion example
  return deleted;
}
