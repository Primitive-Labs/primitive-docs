import type { JsBaoClient } from "js-bao-wss-client";

// Create a new blob bucket (admin/owner only). `ttlTier` and `accessPolicy`
// are closed string-literal unions on the JS side.
export async function createBucket(client: JsBaoClient, bucketKey: string) {
  // #region example
  const bucket = await client.blobBuckets.createBucket({
    bucketKey,
    name: "User avatars",
    description: "Profile images uploaded by members",
    ttlTier: "permanent",
    accessPolicy: "public-read",
  });
  // #endregion example
  return bucket;
}
