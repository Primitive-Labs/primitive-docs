import type { JsBaoClient } from "js-bao-wss-client";

// Bucket administration (admin/owner only): create, list, get, and delete
// buckets. Deleting a bucket cascades to every blob inside it.
export async function adminBuckets(client: JsBaoClient) {
  // #region example
  await client.blobBuckets.createBucket({
    bucketKey: "uploads",
    name: "User uploads",
    ttlTier: "28d",
    accessPolicy: "authenticated",
  });

  const buckets = await client.blobBuckets.listBuckets();
  const bucket = await client.blobBuckets.getBucket("uploads");

  await client.blobBuckets.deleteBucket("uploads"); // cascades to all blobs
  // #endregion example
  return { buckets, bucket };
}
