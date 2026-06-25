import JsBaoClient

// Change a bucket's access without recreating it (admin/owner only).
// Setting a named preset clears any attached rule set.
func updateBucketAccess(client: JsBaoClient) async throws {
  // #region example
  // Switch the bucket to a different preset.
  _ = try await client.blobBuckets.updateBucket(
    bucketIdOrKey: "uploads",
    params: UpdateBlobBucketParams(preset: .adminOnly)
  )

  // Attach a custom rule set (makes the bucket `custom`); use .clear to remove it.
  _ = try await client.blobBuckets.updateBucket(
    bucketIdOrKey: "uploads",
    params: UpdateBlobBucketParams(ruleSetId: .value("rule-set-id"))
  )
  // #endregion example
}
