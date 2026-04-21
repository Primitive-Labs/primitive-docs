[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / InvitationEvent

# Interface: InvitationEvent

Real-time notification that a document invitation has changed state.

Emitted over the `invitation` event channel (`client.on("invitation", ...)`).

**Important:** events are targeted — most actions are delivered to only one
side of the invitation (inviter _or_ invitee, not both). Consumers must
write a switch that handles every action value, or they will silently drop
events. See [InvitationEvent.action](#action) for the full list and who
receives each.

## Properties

### acceptedBy?

> `optional` **acceptedBy**: `string`

UserId of the invitee who accepted. Populated only when `action === "accepted"`.

***

### action

> **action**: `"created"` \| `"updated"` \| `"cancelled"` \| `"declined"` \| `"accepted"`

The lifecycle transition that just occurred for this invitation.

**Targeting (who receives each action — note the asymmetry):**

- `"created"`   — sent to the **invitee only**. A new invitation has been
                  sent to them; their UI should surface it.
- `"updated"`   — sent to the **invitee only**. An existing pending
                  invitation was changed (e.g. permission re-issued /
                  expiry extended).
- `"cancelled"` — sent to the **invitee only**. The inviter (or an admin)
                  cancelled the pending invitation; the invitee's UI
                  should drop it from their pending list.
- `"declined"`  — sent to **both the invitee and the inviter**. The
                  invitee explicitly declined; both sides' UIs should
                  update (invitee removes from pending, inviter sees the
                  outcome).
- `"accepted"`  — sent to the **inviter only**. The invitee accepted and
                  now holds a `DocumentPermission`; the inviter's UI can
                  update collaborator lists. `acceptedBy` carries the
                  accepting user's `userId`.

New action values may be added in the future (non-breaking); consumer
switches should include a `default` branch that is either a no-op or a
warning rather than throwing.

***

### document?

> `optional` **document**: `object`

#### createdAt?

> `optional` **createdAt**: `string`

#### createdBy?

> `optional` **createdBy**: `string`

#### documentId?

> `optional` **documentId**: `string`

#### lastModified?

> `optional` **lastModified**: `string`

#### tags?

> `optional` **tags**: `string`[]

#### title?

> `optional` **title**: `string`

***

### documentId

> **documentId**: `string`

***

### expiresAt?

> `optional` **expiresAt**: `string`

***

### invitationId

> **invitationId**: `string`

***

### invitedAt?

> `optional` **invitedAt**: `string`

***

### invitedBy?

> `optional` **invitedBy**: `string`

***

### permission

> **permission**: `string`

***

### title?

> `optional` **title**: `string`

***

### type

> **type**: `"invitation"`
