# Blobs and Files

Primitive has two kinds of blob storage:

1. **Document-scoped blobs** — files attached to a specific document. Permissions follow the document. Covered in [Document-Scoped Blobs](./working-with-documents.md#document-scoped-blobs).
2. **Blob buckets** — general-purpose binary storage that isn't tied to a document. Each bucket has its own access preset and retention tier. Covered here.

Use buckets when you need file storage that doesn't map cleanly onto a document:

- Thumbnails, generated assets, and other computed artifacts
- User avatars
- Workflow outputs (PDF reports, exported spreadsheets)
- Short-lived transfer files (time-boxed download links)
- Public assets (logos, brand images) that need to be served without auth

## Quick Start

### 1. Define a Bucket

```toml
# config/blob-buckets/avatars.toml
[bucket]
key = "avatars"
name = "User avatars"
preset = "authenticated"
ttlTier = "permanent"
```

Push it:

```bash
primitive sync push
```

Or via the CLI:

```bash
primitive blob-buckets create \
  --key avatars \
  --name "User avatars" \
  --preset authenticated \
  --ttl permanent
```

### 2. Upload

::: code-group

<<< ../../examples/blobs/bucket-upload.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/bucket-upload.swift#example{swift} [Swift]

:::

Uploads take optional `tags` for organizing and filtering blobs within a bucket.

### 3. Read

::: code-group

<<< ../../examples/blobs/bucket-read.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/bucket-read.swift#example{swift} [Swift]

:::

## Access Presets

A bucket's **preset** decides who can use its blobs. App admins and owners always have full access; the preset governs everyone else:

| Preset | Access for everyone else | Use case |
|---|---|---|
| `public` | Anyone — including visitors with no account — can read and list. Only admins and owners write. | Logos, brand images, assets served without auth |
| `authenticated` | Any signed-in member can read, write, list, delete, and share | User avatars, app-wide shared assets |
| `admin-only` | No one but admins and owners | Internal artifacts, workflow outputs you serve out selectively via signed URLs |
| `personal-uploads` | Any member uploads; each member reads, deletes, and shares **only their own** blobs (the bucket isn't enumerable) | User file uploads where everyone keeps their own |

Pick the simplest preset that fits. A `public` bucket is the one case where reads don't require a signed-in user — an unauthenticated request can fetch its blobs directly.

Each preset governs blob operations at the granularity of **read** (download and metadata), **write** (upload), **list** (enumerate the bucket), **delete**, and **share** (mint a signed URL).

### Custom access

When no preset fits, attach a **rule set** to the bucket — set `ruleSetId` in the bucket's TOML, or pass `--rule-set-id` to `primitive blob-buckets create`. The rule set becomes the authority for member access: admins and owners are always allowed, and each operation (read, write, list, delete, share) is decided by a CEL rule. Two values make bucket rules expressive:

- `isAnonymous()` — true when the caller has no account, so `!isAnonymous()` means "any signed-in member."
- `record.blobCreatedBy` — the id of the member who uploaded the blob, for owner-scoped rules like `record.blobCreatedBy == user.userId`.

See [Access Control](./access-control.md#rule-sets-governing-management-operations) for the rule-set model. To change a bucket's preset or attached rule set later, edit its TOML and run `primitive sync push` again, change it from the CLI with `primitive blob-buckets update`, or change it at runtime from your app with `updateBucket` (admin/owner only). Setting a named preset clears any attached rule set:

::: code-group

<<< ../../examples/blobs/bucket-update.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/bucket-update.swift#example{swift} [Swift]

:::

## TTL Tiers

Each bucket has a **TTL tier** that governs how long blobs live before the storage layer deletes them. Pick the shortest tier that fits — short-lived blobs are cheaper and safer.

| Tier | Retention |
|---|---|
| `1d` / `3d` / `14d` / `28d` | Hours-to-weeks scratch storage: download links, transient uploads, session artifacts |
| `180d` / `365d` | Time-boxed user content and reports |
| `permanent` | No TTL — avatars, brand assets, archives |

TTL is set at the bucket level — every blob in the bucket inherits it. To mix retention policies, create separate buckets.

## Signed URLs

Buckets don't expose raw storage URLs. Reads go through either the Primitive API (authenticated) or a time-limited **signed URL** you generate on demand with `client.blobBuckets.getSignedUrl(...)` (shown in [Read](#_3-read) above).

Signed URLs:

- Are safe to put in `<img>` tags or hand to clients that can't attach auth headers
- Expire after the time you specify — from 30 seconds up to 24 hours (default 5 minutes)
- Respect the bucket's preset at generation time — if the user can't share, the call fails
- Don't require the recipient to be authenticated during the valid window

Use a short expiry for user-facing URLs and regenerate as needed.

## Listing and Managing Blobs

::: code-group

<<< ../../examples/blobs/bucket-manage.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/bucket-manage.swift#example{swift} [Swift]

:::

To delete a set of blobs in one call, pass `delete` an array of ids (up to 500). The whole batch is screened against the bucket's `delete` rule before anything is removed, so it succeeds or fails as a unit:

```ts
const result = await client.blobBuckets.delete("exports", expiredIds);
// → { deleted, blobIds, bucketId } — `deleted` counts the ids processed
```

An empty array is a valid no-op, so a computed list that resolves to nothing doesn't throw.

## Using Buckets in Workflows

The `blob.upload` workflow step lets your workflows write to buckets:

```toml
[[steps]]
id = "save-report"
kind = "blob.upload"
bucketKey = "reports"
filename = "{{ meta.workflowRunId }}.pdf"
contentType = "application/pdf"
contentBase64 = "{{ steps.generate-pdf.bytesBase64 }}"
tags = ["monthly"]
```

Step output includes the `blobId`. To share the file, mint a URL with `blob.signedUrl` and pass it to a subsequent step (e.g. email the download link):

```toml
[[steps]]
id = "report-url"
kind = "blob.signedUrl"
bucketKey = "reports"
blobId = "{{ steps.save-report.blobId }}"
expiresInSeconds = 3600

[[steps]]
id = "email-link"
kind = "email.send"
templateType = "report-ready"
to = "{{ input.email }}"
variables = { downloadUrl = "{{ steps.report-url.url }}" }
```

When a flow is done with a blob — a temporary snapshot, an intermediate artifact — clean it up with `blob.delete`:

```toml
[[steps]]
id = "cleanup"
kind = "blob.delete"
bucketKey = "reports"
blobId = "{{ steps.save-report.blobId }}"
```

`blob.delete` returns `{ deleted: true, blobId, bucketId }` and reports success even when the blob is already gone, so a retried run doesn't fail on cleanup it already did. Cleaning up many blobs is one step, not a loop: pass `blobIds` (an array, up to 500) instead of `blobId` — see [Blob Steps](./workflows.md#blob-steps) for the full rules. (For blobs with a natural lifespan, a [TTL tier](#ttl-tiers) expires them without any step at all.)

A blob a workflow reads as **input** needs the opposite care: it must outlive the run's retry window. Retries re-run against the same input, so a `blob.download` in a retried attempt fetches the same blob again — and deleting that blob between attempts fails the next retry — and the run — with a not-found error. Don't delete a blob from a cancel or cleanup path while a run that references it can still retry; give the bucket a [TTL tier](#ttl-tiers) and let expiry clean it up. `blob.delete`'s idempotency covers re-execution of the deleting step itself — it doesn't protect a blob that a retrying run still needs.

Blob steps in a `runAs = "caller"` workflow enforce the bucket's [preset or rule set](#access-presets) with the same per-operation granularity as direct client calls: upload checks `write`, download checks `read`, signedUrl checks `share`, delete checks `delete`. A `runAs = "system"` run is app-privileged and skips the bucket policy.

## Buckets vs. Document Blobs

Use **document blobs** when the file's lifetime matches a document's, access should follow document permissions, and the file is conceptually an attachment to document content.

Use **buckets** when any of these apply:

- Multiple documents (or no documents) reference the file
- You need public or admin-curated access
- You want server-governed TTL
- You need signed URLs for external sharing

## CLI Reference

```bash
# List buckets
primitive blob-buckets list

# Inspect one
primitive blob-buckets get avatars

# Update a bucket's access, name, or description
primitive blob-buckets update avatars --preset admin-only
primitive blob-buckets update avatars --rule-set-id <ruleSetId>

# List blobs in a bucket
primitive blob-buckets list-blobs avatars

# Upload a file from your machine
primitive blob-buckets upload avatars ./alice.jpg --content-type image/jpeg --tags profile

# Generate a signed URL
primitive blob-buckets signed-url avatars <blobId> --expires 3600

# Delete one or more blobs (multiple ids delete as one batch;
# --batch forces the batch endpoint even for a single id)
primitive blob-buckets delete-blob avatars <blobId> [<blobId>...]

# Delete a bucket
primitive blob-buckets delete avatars
```

## Limits

- **Max object size** — 100 MB per blob.
- **Batch delete** — 500 ids per call, from the client, the CLI, or the `blob.delete` workflow step.
- **Signed URL expiry** — see [Signed URLs](#signed-urls) for the range and default.

## Next Steps

- **[Document-Scoped Blobs](./working-with-documents.md#document-scoped-blobs)** — Files attached to a document, with the document's sharing
- **[Working with Databases](./working-with-databases.md)** — If your records need file attachments with structured metadata, store the `blobId` in a database and use a bucket with the matching access policy
- **[Workflows](./workflows.md)** — Multi-step server-side automation
