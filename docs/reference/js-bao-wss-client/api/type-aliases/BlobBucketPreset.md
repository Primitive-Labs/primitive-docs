[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / BlobBucketPreset

# Type Alias: BlobBucketPreset

> **BlobBucketPreset** = `"public"` \| `"authenticated"` \| `"admin-only"` \| `"personal-uploads"` \| `"custom"`

Named access preset (#1020). Supersedes the legacy `accessPolicy` enum. A
bucket is either a named preset or `custom` (rule-set-backed).
  - `public`           — anyone (incl. anonymous) can read/list
  - `authenticated`    — any signed-in member can read/write
  - `admin-only`       — admin/owner only (replaces the old `owner-only`)
  - `personal-uploads` — members read/delete/share their OWN blobs; list is
                         admin-only
  - `custom`           — governed by an attached `ruleSetId`
