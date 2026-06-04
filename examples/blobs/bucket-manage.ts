import type { JsBaoClient } from "js-bao-wss-client";

// List, inspect, and delete blobs in a bucket.
export async function manageBucket(client: JsBaoClient, blobId: string) {
  // #region example
  // List blobs in the bucket
  const { items, cursor } = await client.blobBuckets.list("avatars", { limit: 50 });

  // One blob's metadata
  const meta = await client.blobBuckets.getMetadata("avatars", blobId);

  // Delete a blob
  await client.blobBuckets.delete("avatars", blobId);
  // #endregion example
  return { items, cursor, meta };
}
