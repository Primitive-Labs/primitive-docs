import type { JsBaoClient } from "js-bao-wss-client";

// Mint a time-limited signed URL that downloads a blob without auth.
// `expiresInSeconds` is optional and defaults server-side.
export async function getSignedUrl(
  client: JsBaoClient,
  bucketIdOrKey: string,
  blobId: string,
) {
  // #region example
  const signed = await client.blobBuckets.getSignedUrl(
    bucketIdOrKey,
    blobId,
    3600,
  );
  const url = signed.url;
  // #endregion example
  return url;
}
