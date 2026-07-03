# Factual Review: `blob-buckets.md`

Page reviewed: `.claude/skills/docs-page-review-workspace/fixtures/blob-buckets.md`
(snapshot of `docs/getting-started/blob-buckets.md`).

Verified against platform source in `library_repos/js-bao-wss` (server controllers,
client API, workflow step, CLI sync + CLI command definitions) and the installed
`primitive` CLI v1.0.49. No repo files were modified.

## Verdict

The page is **substantially inaccurate on its core reference facts**. The two
defining attributes of a bucket — its TTL tier values and its access-policy
values — are both wrong (the page invents names that the platform rejects). The
config TOML shape is wrong, an entire access mode (`cel` / inline rules) is
documented that does not exist, and the signed-URL maximum expiry is overstated
by 7x. A developer copying the Quick Start TOML or the policy/TTL tables would
get 400 validation errors from the API.

Source of truth files:
- TTL/access constants + create/get/delete: `library_repos/js-bao-wss/src/app-api/controllers/blob-buckets-controller.ts`
- Upload / read / signed-url / access checks: `library_repos/js-bao-wss/src/app-api/controllers/bucket-blobs-controller.ts`
- Client types/methods: `library_repos/js-bao-wss/src/client/api/blobBucketsApi.ts`
- Workflow steps: `library_repos/js-bao-wss/src/workflows/steps/blob-step.ts`
- Sync TOML (pull serialize + push parse): `library_repos/js-bao-wss/cli/src/commands/sync.ts`
- CLI command defs: `library_repos/js-bao-wss/cli/src/commands/blob-buckets.ts` (confirmed against installed `primitive` v1.0.49)

---

## Critical errors (page is factually wrong; copy-paste fails)

### C1. TTL tier names are all invalid (except `permanent`, which is misspelled `persistent`)
**Lines 26-28 (Quick Start TOML), 86-87 (CEL TOML), 119-130 (TTL Tiers table).**

Actual valid tiers (`VALID_TTL_TIERS`, blob-buckets-controller.ts:6-14; identical in
client `BlobBucketTtlTier` and CLI `--ttl` help):

```
1d, 3d, 14d, 28d, 180d, 365d, permanent
```

The page documents `1-hour`, `1-day`, `30-days`, `persistent` — **none of these
exist.** `create()` rejects anything not in the list with HTTP 400
"ttlTier must be one of: ...". Specific problems:

- `ttlTier = "persistent"` (Quick Start, line 27) → invalid; correct value is `permanent`.
- `ttlTier = "30-days"` (CEL example, line 87) → invalid; nearest real tier is `28d`.
- TTL table (124-128): `1-hour` / `1-day` / `30-days` / `persistent` all wrong.
  There is **no 1-hour tier** at all; the shortest tier is `1d` (1 day). The real
  ladder is 1d / 3d / 14d / 28d / 180d / 365d / permanent.
- The "Retention" descriptions are therefore also wrong (no "1 hour" retention exists).

Note the page is internally inconsistent: the CLI Quick Start (line 43) uses
`--ttl permanent` (the *correct* value) while the TOML and table use the
nonexistent `persistent`/`1-hour`/etc.

### C2. Access-policy names are wrong, and the policy table misdescribes behavior
**Lines 26 (Quick Start), 70-75 (Access Policies table), 73-74.**

Actual valid policies (`VALID_ACCESS_POLICIES`, blob-buckets-controller.ts:18-22;
identical in client and CLI `--access` help):

```
public-read, authenticated, owner-only
```

The page uses `public`, `authenticated`, `owner`, `cel`:

- `public` → must be `public-read`. `accessPolicy = "public"` is rejected (400).
- `owner` → must be `owner-only`.
- `cel` → **does not exist as an access policy** (see C3).
- `authenticated` is the one correct value.
- Quick Start TOML line 26 `accessPolicy = "authenticated"` is valid; but any
  example using `public`/`owner`/`cel` will 400.

Behavior table errors (rows in 72-75), checked against `checkReadAccess` /
`checkWriteAccess` (bucket-blobs-controller.ts:97-128):

- **`owner-only` read** — page (line 74) says "Uploader only (+ admins)". **Wrong.**
  The code grants read on `owner-only` to **admin/owner roles only** — there is no
  per-uploader read grant; a non-admin uploader cannot read back their own blob via
  the policy check (bucket-blobs-controller.ts:109-112 returns 403 for any
  non-admin). `blob.uploaderId`-style ownership matching is **not implemented**.
- **`owner-only` / `owner` write** — page says "Any signed-in user". The code's
  `checkWriteAccess` only allows writes for `authenticated` policy or admin/owner;
  for `owner-only` a non-admin signed-in user gets 403 (falls through to "Access
  denied", bucket-blobs-controller.ts:116-127). So write on `owner-only` is
  **admin/owner only**, not "any signed-in user".
- **`public-read` write** — page says "Admins only (via CLI/sync)". Roughly correct
  in effect (non-admin writes get 403), though writes are not limited to CLI/sync —
  an admin/owner token via the client API can write too.
- **`public-read` read** — page says "Anyone (signed URL still required)". The
  policy check allows read for everyone, but note authenticated API download also
  works for admins/owners directly; "signed URL still required" is an
  overstatement (an authenticated client `download()` works without a signed URL).

### C3. CEL access policy and inline `[blobBucket.rules]` do not exist
**Lines 75, 77-104 (entire "CEL Rules" section), 88-92 (TOML), 94-104 (variables table).**

There is **no `cel` access policy** and **no inline rules mechanism** for blob
buckets anywhere in the platform:

- `VALID_ACCESS_POLICIES` has only the three values in C2.
- The access checks (`checkReadAccess`/`checkWriteAccess`) never evaluate CEL,
  never read `ruleSetId`, and never look at `blob.metadata`, `blob.uploaderId`,
  `user.role`, `isMemberOf`, or `hasRole`. None of these variables exist for
  bucket access.
- Buckets *do* store an optional `ruleSetId` (a reference to a separately-defined
  rule set), surfaced in create payload / TOML — but it is **never consulted** by
  the bucket access path in the current code, and it is an **ID reference**, not
  an inline `[blobBucket.rules] read=/write=/delete=` block.
- Sync push (sync.ts:2449-2474) parses only `bucket.key/name/ttlTier/accessPolicy/
  description/ruleSetId`. It does **not** parse a `rules` sub-table. The
  `[blobBucket.rules]` TOML on lines 88-92 is silently ignored — and the table
  name is wrong anyway (see C4).

The whole "CEL Rules" subsection (incl. the variables table on 96-104 and the
"attach data at upload time" note) describes a feature that isn't there. The
page's own `::: warning Content review needed` (115-117) half-acknowledges the
metadata-vs-tags problem but frames it as a minor follow-up; in reality the
entire CEL access model is fictional.

### C4. Config TOML table name and field name are wrong
**Lines 22-28, 82-92, 159-186.**

The page uses table header `[blobBucket]` and field `displayName`. The actual
sync TOML (round-tripped by `serializeBlobBucket`, sync.ts:321-341; parsed by push,
sync.ts:2449-2451) is:

```toml
[bucket]
key = "avatars"
name = "User avatars"
ttlTier = "permanent"
accessPolicy = "authenticated"
# description = "..."   (optional)
# ruleSetId = "..."     (optional)
```

- Table is **`[bucket]`**, not `[blobBucket]`. Push reads `tomlData.bucket`; a
  `[blobBucket]` table is ignored (falls back to `{}`, then `key` defaults to the
  filename — `name` defaults to the key, `ttlTier`/`accessPolicy` become
  `undefined` → server 400).
- Field is **`name`**, not `displayName`. The server create endpoint requires
  `name` (blob-buckets-controller.ts:99-101); `displayName` is not read anywhere.
  (Note `displayName` *is* the convention for prompts, which may be the source of
  the confusion — see `serializePrompt`.)

### C5. Signed-URL maximum expiry is 24 hours, not 7 days
**Lines 139 ("Expire after the time you specify (max 7 days)") and 232 ("Signed URL expiry — capped at 7 days").**

Both the API controller and the workflow step clamp expiry to
`Math.min(requestedExpiry, 60 * 60 * 24)` = **86400 s = 24 hours**, with a floor
of 30 s and default 300 s (bucket-blobs-controller.ts:432-436;
blob-step.ts:207-210). There is no 7-day path. "max 7 days" is wrong in two
places; the real cap is **24 hours**.

---

## Minor / mostly-correct (note for completeness)

### M1. Upload takes `tags`, not `metadata` — correct as flagged, but understated
Lines 105-117 correctly note uploads accept `tags: string[]` (client
`BlobUploadParams.tags`, sent as `X-Blob-Tags`; server `parseTags`) and that
there is no arbitrary `metadata` field. This is accurate. But because the CEL
section that *consumes* `blob.metadata.*` is itself fictional (C3), the right fix
is to delete the CEL section, not "reconcile in a follow-up."

### M2. Client method names — correct
`client.blobBuckets.getSignedUrl(...)` (lines 134, referenced in Read) matches
`BlobBucketsAPI.getSignedUrl(bucketIdOrKey, blobId, expiresInSeconds?)`. Other
methods used implicitly (upload/list/getMetadata/download/delete) all exist with
those names. Swift client (`swift-client/.../BlobBucketsAPI.swift`) has parity —
`getSignedUrl`, `upload(tags:)`, `getMetadata`, `download`, `delete` all present.
No JS↔Swift drift to file here.

### M3. Workflow steps — correct
- `blob.upload` step (lines 159-168): `bucketKey`, `filename`, `contentType`,
  `contentBase64`, `tags` are all valid fields (blob-step.ts:18-29). Output
  exposes `blobId` (line 170) — correct.
- `blob.signedUrl` step (lines 172-178): `bucketKey`, `blobId`,
  `expiresInSeconds` valid; output field `url` (line 185 `steps.report-url.url`)
  correct (blob-step.ts:228). `expiresInSeconds = 3600` is within the 24h cap.
- Caveat: the `blob.upload` step also supports plain `content` (UTF-8) as an
  alternative to `contentBase64`; not wrong, just unmentioned.

### M4. CLI Reference (lines 206-227) — correct
All subcommands verified against installed `primitive` v1.0.49:
`list`, `get`, `list-blobs`, `upload ... --content-type`, `signed-url ... --expires`,
`delete-blob`, `delete ... -y` all exist with those names/flags. The
Quick-Start CLI block (lines 39-44) uses correct flags `--key/--name/--access/--ttl`
and a valid `--ttl permanent`. (`signed-url --expires` default is 300 s, max 24h.)

### M5. Limits (lines 230-233) — mostly correct
- Max object size 100MB — **correct** (`ONE_HUNDRED_MB = 100 * 1024 * 1024`,
  enforced on both Content-Length pre-check and actual body,
  bucket-blobs-controller.ts:16, 200-212).
- Signed-URL expiry "capped at 7 days" — **wrong**, it's 24 h (see C5).
- "Primitive-managed objects only" — consistent with the code (objects are keyed
  and tracked by Primitive); fine in spirit.

### M6. Referenced example files do not exist
Lines 50-52, 60-62, 109-111, 149-151 `<<<` include
`../../examples/blobs/bucket-{upload,read,manage}.{ts,swift}`. There is **no
`docs/examples/blobs/` directory** in the repo and no `bucket-*` example files
anywhere under `docs/`. As written these VitePress snippet includes would fail
to build. (Out of scope for "platform facts" but worth flagging since the page
relies on them for every code sample.)

### M7. bucketKey constraints (unmentioned, not an error)
Keys must match `^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$` (start alnum, ≤64 chars,
alnum/`_`/`-`). Not stated on the page; the sample key `team-exports` is valid.

---

## Suggested correction summary (facts only)

1. TTL tiers → `1d, 3d, 14d, 28d, 180d, 365d, permanent` (drop `1-hour/1-day/30-days/persistent`).
2. Access policies → `public-read, authenticated, owner-only` (drop `public/owner/cel`).
3. Delete the entire "CEL Rules" section, the variables table, and the metadata
   warning — no CEL/inline-rules access model exists for buckets. (Mention
   `ruleSetId` only if/when access actually evaluates it.)
4. Fix Quick Start + CEL TOML to `[bucket]` table with `name` (not `displayName`).
5. Signed-URL max expiry → 24 hours (two places: signed-URLs section + Limits).
6. Re-check `owner-only` read/write semantics: in current code both read and
   write on `owner-only` are admin/owner-only; there is no per-uploader grant.
7. Ensure the referenced `examples/blobs/bucket-*` snippet files exist before publishing.
