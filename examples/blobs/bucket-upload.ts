import type { JsBaoClient } from "js-bao-wss-client";

// Upload a blob into a bucket (referenced by key or id).
export async function uploadToBucket(client: JsBaoClient, data: Uint8Array) {
  // #region example
  const { blobId } = await client.blobBuckets.upload("avatars", {
    filename: "alice.jpg",
    contentType: "image/jpeg",
    data,
    tags: ["profile"],
  });
  // #endregion example
  return blobId;
}
