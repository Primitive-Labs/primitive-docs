import type { JsBaoClient } from "js-bao-wss-client";

// List blobs in a bucket. Uses R2 cursor pagination via the options object.
export async function list(client: JsBaoClient, bucketIdOrKey: string) {
  // #region example
  const page = await client.blobBuckets.list(bucketIdOrKey, { limit: 50 });
  const items = page.items;
  const nextCursor = page.cursor;
  // #endregion example
  return { items, nextCursor };
}
