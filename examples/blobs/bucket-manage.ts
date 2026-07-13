import type { JsBaoClient } from "js-bao-wss-client";

// List, inspect, and delete blobs in a bucket.
export async function manageBucket(client: JsBaoClient, blobId: string, expiredIds: string[]) {
  // #region example
  // List blobs in the bucket
  const { items, cursor } = await client.blobBuckets.list("avatars", { limit: 50 });

  // One blob's metadata
  const meta = await client.blobBuckets.getMetadata("avatars", blobId);

  // Delete a blob
  await client.blobBuckets.delete("avatars", blobId);

  // Delete a batch of blobs (up to 500 ids) in one call
  const batchResult = await client.blobBuckets.delete("avatars", expiredIds);
  // batchResult: { deleted, blobIds, bucketId }
  // #endregion example
  return { items, cursor, meta, batchResult };
}
