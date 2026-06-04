# Agent Guide to Primitive Blob Buckets

Guidelines for AI agents implementing bucket storage in Primitive apps. **Blob buckets** are general-purpose binary storage that isn't tied to a document — use them for avatars, public assets, workflow outputs, short-lived exports, and anywhere you need a signed URL. Binary files attached to a specific document live in the [Blobs guide](AGENT_GUIDE_TO_PRIMITIVE_BLOBS.md).

## Bucket operations

The API is **flat** (`client.blobBuckets.upload(bucketIdOrKey, …)`), not a `.bucket(key)` builder, and accepts `tags: string[]` — there is no arbitrary `metadata` field on upload.

### Upload

```typescript
  const { blobId } = await client.blobBuckets.upload("avatars", {
    filename: "alice.jpg",
    contentType: "image/jpeg",
    data,
    tags: ["profile"],
  });
```

### Read (signed URL / download)

```typescript
  // Signed URL (for <img> tags, etc.)
  const { url } = await client.blobBuckets.getSignedUrl("avatars", blobId, 3600);

  // Or download the bytes directly
  const bytes = await client.blobBuckets.download("avatars", blobId);
```

### List / metadata / delete

```typescript
  // List blobs in the bucket
  const { items, cursor } = await client.blobBuckets.list("avatars", { limit: 50 });

  // One blob's metadata
  const meta = await client.blobBuckets.getMetadata("avatars", blobId);

  // Delete a blob
  await client.blobBuckets.delete("avatars", blobId);
```

### Bucket admin (create / list / get / delete)

Admin/owner only. Deleting a bucket cascades to every blob inside it.

```typescript
  await client.blobBuckets.createBucket({
    bucketKey: "uploads",
    name: "User uploads",
    ttlTier: "28d",
    accessPolicy: "authenticated",
  });

  const buckets = await client.blobBuckets.listBuckets();
  const bucket = await client.blobBuckets.getBucket("uploads");

  await client.blobBuckets.deleteBucket("uploads"); // cascades to all blobs
```

## Overview

**Blob buckets** — general-purpose storage outside any document context. Each bucket has its own access policy, TTL tier, and supports time-limited signed URLs. **Cap: 100 MB per blob.**

```typescript
// There is NO bucket() context object. The bucket key/ID is a positional arg.
await client.blobBuckets.upload("avatars", { filename, contentType, data });
await client.blobBuckets.getSignedUrl("avatars", blobId, 3600);
```


**Decision rule:** use document-scoped blobs when the file's lifetime and access naturally match a document's. Use a bucket for avatars, workflow outputs, public assets, anonymous reads via signed URLs, or anything that should live outside any specific document. Document-scoped blobs (10 MB cap, permission inheritance, offline caching) are covered in the [Blobs guide](AGENT_GUIDE_TO_PRIMITIVE_BLOBS.md).

---

## Bucket configuration

A bucket has a `ttlTier` and an `accessPolicy`. Configure via TOML sync (preferred), the CLI, or `createBucket` (see **Bucket admin** above).

```toml
# config/blob-buckets/avatars.toml
[bucket]
key = "avatars"
name = "User avatars"
description = "Profile pictures"           # optional
ttlTier = "permanent"                       # 1d | 3d | 14d | 28d | 180d | 365d | permanent
accessPolicy = "authenticated"              # public-read | authenticated | owner-only
# ruleSetId is accepted in TOML/CLI but currently NOT enforced for bucket reads/writes.
```

The TOML root table is `[bucket]` (not `[blobBucket]`). The CLI's `primitive sync` reads from `config/blob-buckets/<key>.toml`.

Or via CLI:

```bash
primitive blob-buckets create \
  --key avatars --name "User avatars" \
  --ttl permanent --access authenticated
```

### Access policies

| Policy           | Read                                  | Write                                 |
|------------------|---------------------------------------|---------------------------------------|
| `public-read`    | Anyone (no auth)                      | Admin/owner only                      |
| `authenticated`  | Any signed-in user (or admin/owner)   | Any signed-in user (or admin/owner)   |
| `owner-only`     | Admin/owner only                      | Admin/owner only                      |

A `ruleSetId` field is accepted at bucket creation but is currently **not enforced** by the bucket blob access checks — only the three `accessPolicy` values above gate reads and writes. If you need finer-grained control today, model it at the application layer (e.g. issue signed URLs only after your own check passes).

### TTL tiers

The storage layer automatically expires objects based on the bucket's `ttlTier`. Pick the shortest tier that fits.

| Tier        | Lifetime                          |
|-------------|-----------------------------------|
| `1d`        | ~1 day                            |
| `3d`        | ~3 days                           |
| `14d`       | ~14 days                          |
| `28d`       | ~28 days                          |
| `180d`      | ~180 days                         |
| `365d`      | ~365 days                         |
| `permanent` | No automatic expiry               |

Don't reach for `permanent` for short-lived content — pay only for what you need.

---

## Client API

The bucket API lives at `client.blobBuckets`. **All methods take `bucketIdOrKey` as a positional argument** — there is no per-bucket context object. The core operations (upload, signed URL, download, list, metadata, delete) are shown in **Bucket operations** above; bucket admin in **Bucket admin**.

Notes on the surface:

- **Upload** `tags: string[]` is the only extra metadata — there is no arbitrary `metadata` field. Result: `{ blobId, bucketId, filename, contentType, numBytes, sha256, tags, createdBy }`.Accepts `data: ArrayBuffer | Uint8Array | Blob | string`; a `File` works (it's a `Blob`).- **Signed URL** defaults to 300s, min 30s, max 86400s (clamped server-side). Result: `{ url, token, expiresAt (unix seconds), expiresInSeconds }`.
- **Download** returns the blob bytes via an authenticated request.The result is an `ArrayBuffer`.- **List** is cursor-paginated; default limit 100, max 1000.

### Don't do this

```typescript
// DON'T: try to use a per-bucket context object — it doesn't exist.
const bucket = client.blobBuckets.bucket("avatars"); // TypeError
await bucket.upload(...);                            // TypeError

// DON'T: invent a `signedUrl` method — the actual name is getSignedUrl.
await client.blobBuckets.signedUrl("avatars", blobId, { expiresInSeconds: 3600 });
// Correct:
await client.blobBuckets.getSignedUrl("avatars", blobId, 3600);

// DON'T: attach `metadata: {...}` at upload time. The bucket upload API only
// accepts `tags: string[]`. There is no arbitrary metadata field, and even
// `tags` are stored as object metadata — they don't gate access on their own.
await client.blobBuckets.upload("k", { filename, data, metadata: {} }); // ignored

// DON'T: ask for a >24h signed URL — the server clamps to 86400s.
await client.blobBuckets.getSignedUrl("k", id, 7 * 86400); // becomes 86400

// DON'T: put auth-required URLs in <img src>. Use a signed URL or download() + Blob URL.
imgEl.src = `/app/${appId}/api/blob-buckets/${bucketId}/blobs/${blobId}`; // 401
```

### Signed URLs

The signed-URL call is shown in **Read (signed URL / download)** above. A signed URL bypasses the bucket's access policy entirely (anyone with the URL can read until it expires). Treat them as bearer tokens. Don't email or log them.

The signed-URL request endpoint requires `member` permission on the app, so generation itself is restricted to authenticated app users — even for a `public-read` bucket. The resulting URL is then unauthenticated.

To display a bucket image, point an element at the returned `url`:

```typescript
const { url, expiresAt } = await client.blobBuckets.getSignedUrl(
  "avatars",
  blobId,
  3600
);
imgEl.src = url;

// Cache the URL (and re-fetch a new one slightly before expiresAt). Don't call
// getSignedUrl on every render — each call is a server round-trip.
```

---

## Workflow integration

The `blob.upload`, `blob.download`, and `blob.signedUrl` workflow steps write to and read from buckets. Steps reference the bucket by `bucketId` or `bucketKey`. See the [Workflows guide](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md).

---

## Anti-patterns

- Storing user-uploaded documents in a bucket when they should be document-scoped blobs with permission inheritance.
- Leaving a bucket on `permanent` when blobs are only needed briefly. Object storage is billed; pick the shortest tier.
- Using `public-read` and then trying to enforce per-user access. `public-read` bypasses all per-user checks at read time. Use `authenticated` and gate access in your own code before issuing signed URLs.
- Calling `getSignedUrl` on every render. Each call is a network round-trip; cache the URL until `expiresAt - 60s`.
- Writing to the underlying object store outside of Primitive. Side-channel objects don't appear in `list()` and won't be cleaned up by bucket deletion.
- Reusing a `documentId` as a `bucketKey`. Different namespaces; offers no benefit and is confusing.
