# Blobs and Files

Primitive has two kinds of blob storage:

1. **Document-scoped blobs** — files attached to a specific document. Permissions follow the document. Covered in [Document-Scoped Blobs](./working-with-documents.md#document-scoped-blobs).
2. **Blob buckets** — general-purpose binary storage that isn't tied to a document. Each bucket has its own access policy and retention tier. Covered here.

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
accessPolicy = "authenticated"
ttlTier = "permanent"
```

Push it:

```bash
primitive sync push --dir ./config
```

Or via the CLI:

```bash
primitive blob-buckets create \
  --key avatars \
  --name "User avatars" \
  --access authenticated \
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

## Access Policies

A bucket's **access policy** decides who can read and write its blobs. App admins and owners always have full access; the policy governs everyone else:

| Policy | Read | Write | Use case |
|---|---|---|---|
| `public-read` | Anyone | Admins only | Brand assets, marketing images |
| `authenticated` | Any signed-in user | Any signed-in user | User avatars, app-wide shared assets |
| `owner-only` | Admins only | Admins only | Internal artifacts, workflow outputs your app serves out selectively via signed URLs |

Pick the simplest policy that fits.

For member access that the three policies can't express, attach a [rule set](./access-control.md#rule-sets-governing-management-operations) to the bucket — set `ruleSetId` in the bucket's TOML, or pass `--rule-set-id` to `primitive blob-buckets create`. An attached rule set becomes the authority for member-level access: admins and owners are always allowed, unauthenticated callers are rejected, and every other read or write is decided by the rule set's CEL rules.

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
- Respect the bucket's access policy at generation time — if the user can't read, the call fails
- Don't require the recipient to be authenticated during the valid window

Use a short expiry for user-facing URLs and regenerate as needed.

## Listing and Managing Blobs

::: code-group

<<< ../../examples/blobs/bucket-manage.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/bucket-manage.swift#example{swift} [Swift]

:::

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

# List blobs in a bucket
primitive blob-buckets list-blobs avatars

# Upload a file from your machine
primitive blob-buckets upload avatars ./alice.jpg --content-type image/jpeg --tags profile

# Generate a signed URL
primitive blob-buckets signed-url avatars <blobId> --expires 3600

# Delete a blob
primitive blob-buckets delete-blob avatars <blobId>

# Delete a bucket
primitive blob-buckets delete avatars
```

## Limits

- **Max object size** — 100 MB per blob.
- **Signed URL expiry** — 30 seconds to 24 hours.

## Next Steps

- **[Document-Scoped Blobs](./working-with-documents.md#document-scoped-blobs)** — Files attached to a document, with the document's sharing
- **[Working with Databases](./working-with-databases.md)** — If your records need file attachments with structured metadata, store the `blobId` in a database and use a bucket with the matching access policy
- **[Workflows](./workflows.md)** — Multi-step server-side automation
