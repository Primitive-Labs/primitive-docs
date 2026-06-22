import type { JsBaoClient } from "js-bao-wss-client";

// The bucket API is flat: there is NO bucket() context object. The bucket
// key (or id) is always the first positional argument to each method.
export async function bucketPositionalArgs(
  client: JsBaoClient,
  blobId: string,
  filename: string,
  contentType: string,
  data: Uint8Array,
) {
  // #region example
  // The bucket key/ID is a positional arg — there is no bucket() context object.
  await client.blobBuckets.upload("avatars", { filename, contentType, data });
  await client.blobBuckets.getSignedUrl("avatars", blobId, 3600);
  // #endregion example
}
