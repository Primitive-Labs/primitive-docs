[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / AddCollectionMemberParams

# Type Alias: AddCollectionMemberParams

> **AddCollectionMemberParams** = \{ `collectionUrl?`: `string`; `email?`: `never`; `note?`: `string`; `permission`: `"reader"` \| `"read-write"`; `sendEmail?`: `boolean`; `userId`: `string`; \} \| \{ `collectionUrl?`: `string`; `email`: `string`; `note?`: `string`; `permission`: `"reader"` \| `"read-write"`; `sendEmail?`: `boolean`; `userId?`: `never`; \}

Discriminated union: provide either `userId` (existing app user) OR `email`
(existing user OR yet-to-sign-up). Mirrors the same shape
`groups.addMember` accepts. Mutual exclusion is enforced server-side.

## Type Declaration

\{ `collectionUrl?`: `string`; `email?`: `never`; `note?`: `string`; `permission`: `"reader"` \| `"read-write"`; `sendEmail?`: `boolean`; `userId`: `string`; \}

### collectionUrl?

> `optional` **collectionUrl**: `string`

Optional URL the email links the recipient to.

### email?

> `optional` **email**: `never`

### note?

> `optional` **note**: `string`

Optional personal note included in the share email.

### permission

> **permission**: `"reader"` \| `"read-write"`

The access level for the member: "reader" for read-only or
"read-write" for full access.

### sendEmail?

> `optional` **sendEmail**: `boolean`

When true, send the share email after adding the user.

### userId

> **userId**: `string`

The unique identifier of the user to add

\{ `collectionUrl?`: `string`; `email`: `string`; `note?`: `string`; `permission`: `"reader"` \| `"read-write"`; `sendEmail?`: `boolean`; `userId?`: `never`; \}

### collectionUrl?

> `optional` **collectionUrl**: `string`

Optional URL included in the email body for context.

### email

> **email**: `string`

The recipient's email address (mutually exclusive with userId)

### note?

> `optional` **note**: `string`

Optional personal note included in the share email.

### permission

> **permission**: `"reader"` \| `"read-write"`

The access level the recipient will hold once added.

### sendEmail?

> `optional` **sendEmail**: `boolean`

When true, send the deferred-share email containing the tokenized
accept URL composed from the app's configured baseUrl. Requires
the app to have `baseUrl` set.

### userId?

> `optional` **userId**: `never`
