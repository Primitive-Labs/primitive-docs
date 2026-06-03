import type { JsBaoClient } from "js-bao-wss-client";

// Read a bucket blob via a time-limited signed URL, or download the bytes.
export async function readFromBucket(client: JsBaoClient, blobId: string) {
  // #region example
  // Signed URL (for <img> tags, etc.)
  const { url } = await client.blobBuckets.getSignedUrl("avatars", blobId, 3600);

  // Or download the bytes directly
  const bytes = await client.blobBuckets.download("avatars", blobId);
  // #endregion example
  return { url, bytes };
}
