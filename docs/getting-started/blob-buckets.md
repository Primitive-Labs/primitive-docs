# Blob Buckets

Primitive has two kinds of blob storage:

1. **Document-scoped blobs** — files attached to a specific document. Permissions follow the document. Covered in [Blobs and Files](./blobs-and-files.md).
2. **Blob buckets** — general-purpose binary storage that isn't tied to a document. Each bucket has its own access policy, TTL tier, and signed-URL behavior. Covered here.

Use buckets when you need file storage that doesn't map cleanly onto a document. Common cases:

- Thumbnails, generated assets, and other computed artifacts
- User avatars
- Uploads from anonymous users (landing-page forms, job applications)
- Workflow outputs (PDF reports, exported spreadsheets)
- Short-lived transfer files (one-hour download links)
- Public assets (logos, brand assets) that need to be served without auth

## Quick Start

### 1. Define a Bucket

```toml
# config/blob-buckets/avatars.toml
[blobBucket]
key = "avatars"
displayName = "User avatars"
accessPolicy = "authenticated"
ttlTier = "persistent"
```

Push it:

```bash
primitive sync push --dir ./config
```

Or via CLI:

```bash
primitive blob-buckets create \
  --key avatars \
  --display-name "User avatars" \
  --access-policy authenticated \
  --ttl-tier persistent
```

### 2. Upload

```typescript
const { blobId } = await client.blobBuckets
  .bucket("avatars")
  .upload(fileBytes, {
    filename: "alice.jpg",
    contentType: "image/jpeg",
  });
```

### 3. Read

```typescript
// Signed URL (for <img> tags, etc.)
const url = await client.blobBuckets
  .bucket("avatars")
  .signedUrl(blobId, { expiresInSeconds: 3600 });

// Direct read
const bytes = await client.blobBuckets
  .bucket("avatars")
  .read(blobId, { as: "arrayBuffer" });
```

## Access Policies

A bucket's **access policy** decides who can read and write to it. Pick the simplest policy that fits.

| Policy | Read | Write | Use case |
|---|---|---|---|
| `public` | Anyone (signed URL still required) | Admins only (via CLI/sync) | Brand assets, marketing images |
| `authenticated` | Any signed-in user | Any signed-in user | User avatars, app-wide shared assets |
| `owner` | Uploader only (+ admins) | Any signed-in user | Personal uploads, private files |
| `cel` | Custom CEL rule | Custom CEL rule | Role- or group-scoped storage |

### CEL Rules

For fine-grained control, use `accessPolicy = "cel"` and attach rules:

```toml
[blobBucket]
key = "team-exports"
displayName = "Team data exports"
accessPolicy = "cel"
ttlTier = "30-days"

[blobBucket.rules]
read = "isMemberOf('team', blob.metadata.teamId)"
write = "hasRole('admin') || isMemberOf('team', blob.metadata.teamId)"
delete = "hasRole('admin')"
```

Variables available in rules:

| Variable | Description |
|---|---|
| `user.userId` | Authenticated user's ID (or empty string for anonymous) |
| `user.role` | App role |
| `blob.uploaderId` | The user that uploaded this blob |
| `blob.metadata.*` | Arbitrary metadata you set at upload time |
| `isMemberOf(type, id)` | Group membership check |
| `hasRole(role)` | App role check |

Attach metadata at upload time to make rules useful:

```typescript
await client.blobBuckets.bucket("team-exports").upload(bytes, {
  filename: "q2.csv",
  contentType: "text/csv",
  metadata: { teamId: "eng" },
});
```

## TTL Tiers

Each bucket has a **TTL tier** that governs how long blobs live before R2 deletes them. Pick the shortest tier that fits — short-lived blobs are cheaper and safer.

| Tier | Retention | Use case |
|---|---|---|
| `1-hour` | 1 hour | Download links, ephemeral exports |
| `1-day` | 24 hours | Daily reports, transient uploads |
| `30-days` | 30 days | Time-boxed user content, session artifacts |
| `persistent` | No TTL | Avatars, brand assets, permanent archives |

TTL is set at the bucket level — every blob in the bucket inherits it. To mix retention policies, create separate buckets.

## Signed URLs

Buckets don't expose raw R2 URLs. Reads go through either the Primitive Worker (authenticated) or a time-limited **signed URL** you generate on demand:

```typescript
const url = await client.blobBuckets
  .bucket("avatars")
  .signedUrl(blobId, { expiresInSeconds: 3600 });
```

Signed URLs:

- Are safe to put in `<img>` tags or send to clients that can't attach auth headers
- Expire after the time you specify (max 7 days)
- Respect the bucket's access policy at generation time — if the user can't read, `signedUrl` throws
- Don't require the recipient to be authenticated during the valid window

Use a short expiry (minutes to hours) for user-facing URLs, and regenerate as needed.

## Listing and Managing Blobs

```typescript
const bucket = client.blobBuckets.bucket("avatars");

// List
const { items, cursor } = await bucket.list({ limit: 50 });

// Metadata
const meta = await bucket.get(blobId);

// Delete
await bucket.delete(blobId);
```

## Using Buckets in Workflows

A new `blob` workflow step lets your workflows write to buckets:

```toml
[[steps]]
name = "save-report"
type = "blob"
bucket = "reports"
action = "upload"
filename = "{{ meta.workflowRunId }}.pdf"
contentType = "application/pdf"
bytesFrom = "{{ outputs.generate-pdf.bytes }}"
metadata = { reportType = "monthly", teamId = "{{ input.teamId }}" }
```

Step output includes the `blobId`, which you can pass to a subsequent step (e.g. email the download link):

```toml
[[steps]]
name = "email-link"
type = "email.send"
templateType = "report-ready"
to = "{{ input.email }}"
variables = { downloadUrl = "{{ outputs.save-report.signedUrl }}" }
```

## Buckets vs. Document Blobs

When do you use which? Use **document blobs** when:

- The file's lifetime matches a document's lifetime
- Access should follow document permissions
- The file is conceptually an attachment to document content

Use **buckets** when any of these apply:

- Multiple documents (or no documents) reference the file
- You need CEL-based or public access
- You want server-governed TTL
- You need signed URLs for external sharing
- The upload comes from an anonymous user

## CLI Reference

```bash
# List buckets
primitive blob-buckets list

# Inspect one
primitive blob-buckets get avatars

# List blobs in a bucket
primitive blob-buckets blobs avatars

# Upload a file from your machine
primitive blob-buckets upload avatars ./alice.jpg --content-type image/jpeg

# Generate a signed URL
primitive blob-buckets signed-url avatars <blobId> --expires 3600

# Delete a blob
primitive blob-buckets delete-blob avatars <blobId>

# Delete a bucket (requires --force if not empty)
primitive blob-buckets delete avatars --force
```

## Limits

- **Max object size** — 100MB per blob (upload).
- **Signed URL expiry** — capped at 7 days.
- **Tracking is R2-only** — Primitive tracks objects it creates in R2. Objects written directly to R2 outside the Primitive API aren't indexed.

## Next Steps

- **[Blobs and Files](./blobs-and-files.md)** — Document-scoped blob storage
- **[Working with Databases](./working-with-databases.md)** — If your records need file attachments with structured metadata, store the `blobId` in a database and use a bucket with the matching access policy
- **[Workflows and Prompts](./workflows-and-prompts.md)** — The `blob` workflow step
