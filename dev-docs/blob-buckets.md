# blobBuckets — `client.blobBuckets`

App-level blob storage namespaces with configurable retention (TTL) tiers and
access policies. Distinct from per-document blobs on
`client.document(id).blobs()`, which are tied to a single Y-CRDT document.

A bucket holds many blobs. Bucket CRUD (`createBucket`, `listBuckets`,
`getBucket`, `deleteBucket`) is admin/owner-only; the blob operations
(`upload`, `list`, `getMetadata`, `download`, `delete`, `getSignedUrl`) act on
blobs inside a bucket, addressed by `bucketIdOrKey`.

## createBucket(params)

Create a new blob bucket (admin/owner only). `bucketKey`, `name`, `ttlTier`,
and `accessPolicy` are required. `ttlTier` is one of `"1d"`, `"3d"`, `"14d"`,
`"28d"`, `"180d"`, `"365d"`, `"permanent"`; `accessPolicy` is one of
`"public-read"`, `"authenticated"`, `"owner-only"`.

::: code-group
<<< ./snippets/blob-buckets/create-bucket.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/create-bucket.swift#example{swift} [Swift]
:::

## listBuckets()

List every blob bucket for the current app (admin/owner only).

::: code-group
<<< ./snippets/blob-buckets/list-buckets.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/list-buckets.swift#example{swift} [Swift]
:::

## getBucket(bucketIdOrKey)

Fetch a single bucket by its `bucketId` or `bucketKey`.

::: code-group
<<< ./snippets/blob-buckets/get-bucket.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/get-bucket.swift#example{swift} [Swift]
:::

## deleteBucket(bucketIdOrKey)

Delete a bucket and every blob inside it. JS resolves to `{ deleted: boolean }`.

::: code-group
<<< ./snippets/blob-buckets/delete-bucket.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/delete-bucket.swift#example{swift} [Swift]
:::

## upload(bucketIdOrKey, params)

Upload a blob into a bucket. Returns metadata including the server-minted
`blobId`. In JS `data` accepts `ArrayBuffer | Uint8Array | Blob | string`; the
Swift client narrows it to `Data` and takes the options as labeled args.

::: code-group
<<< ./snippets/blob-buckets/upload.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/upload.swift#example{swift} [Swift]
:::

## list(bucketIdOrKey, options?)

List blobs in a bucket. Uses R2 cursor pagination — pass `cursor` and `limit`.
JS returns `{ items, cursor? }` (`BucketBlobListResult`); Swift returns the same
shape, typed.

::: code-group
<<< ./snippets/blob-buckets/list.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/list.swift#example{swift} [Swift]
:::

## getMetadata(bucketIdOrKey, blobId)

Read a blob's metadata (size, content type, tags, sha256) without downloading
the bytes.

::: code-group
<<< ./snippets/blob-buckets/get-metadata.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/get-metadata.swift#example{swift} [Swift]
:::

## download(bucketIdOrKey, blobId)

Download a blob's raw bytes. JS resolves to an `ArrayBuffer`; Swift returns
`Data`.

::: tip Divergent shape
Swift hands back a `Data` value where JS resolves to an `ArrayBuffer` — the
idiomatic raw-bytes type on each platform (Swift has no `ArrayBuffer`; JS has no
`Data`). This is a by-design binary-type mapping, the read-side mirror of the
`Data`-only body that `upload` accepts
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/blob-buckets/download.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/download.swift#example{swift} [Swift]
:::

## delete(bucketIdOrKey, blobId)

Delete a single blob from a bucket. JS resolves to `{ deleted: boolean }`.

::: code-group
<<< ./snippets/blob-buckets/delete.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/delete.swift#example{swift} [Swift]
:::

## getSignedUrl(bucketIdOrKey, blobId, expiresInSeconds?)

Mint a time-limited signed URL that downloads a blob without auth. JS returns
`{ url, token, expiresAt, expiresInSeconds }` (`BlobSignedUrlResult`); Swift
returns the same shape, typed.

::: code-group
<<< ./snippets/blob-buckets/get-signed-url.ts#example{ts} [JavaScript]
<<< ./snippets/blob-buckets/get-signed-url.swift#example{swift} [Swift]
:::
