import type { JsBaoClient } from "js-bao-wss-client";

// Fetch one bucket by its bucketId or bucketKey.
export async function getBucket(client: JsBaoClient, bucketIdOrKey: string) {
  // #region example
  const bucket = await client.blobBuckets.getBucket(bucketIdOrKey);
  // #endregion example
  return bucket;
}
