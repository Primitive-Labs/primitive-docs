import type { JsBaoClient } from "js-bao-wss-client";

// Change a bucket's access without recreating it (admin/owner only).
// Setting a named preset clears any attached rule set.
export async function updateBucketAccess(client: JsBaoClient) {
  // #region example
  // Switch the bucket to a different preset.
  await client.blobBuckets.updateBucket("uploads", { preset: "admin-only" });

  // Attach a custom rule set (makes the bucket `custom`); pass null to clear it.
  await client.blobBuckets.updateBucket("uploads", { ruleSetId: "rule-set-id" });
  // #endregion example
}
