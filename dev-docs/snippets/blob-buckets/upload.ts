import type { JsBaoClient } from "js-bao-wss-client";

// Upload a blob into a bucket. `data` accepts ArrayBuffer | Uint8Array | Blob
// | string on the JS side; returns metadata including the minted blobId.
export async function upload(
  client: JsBaoClient,
  bucketIdOrKey: string,
  data: Uint8Array,
) {
  // #region example
  const blob = await client.blobBuckets.upload(bucketIdOrKey, {
    filename: "avatar.png",
    contentType: "image/png",
    data,
    tags: ["avatar", "profile"],
  });
  // #endregion example
  return blob;
}
