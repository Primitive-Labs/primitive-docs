[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CollectionDocumentInfo

# Interface: CollectionDocumentInfo

## Properties

### addedAt

> **addedAt**: `string`

ISO timestamp of when the document entered this collection.

***

### addedBy

> **addedBy**: `string`

UserId of the caller who added the document to the collection.

***

### collectionId

> **collectionId**: `string`

***

### createdAt

> **createdAt**: `string`

ISO timestamp of when the document was created.

***

### createdBy

> **createdBy**: `string`

UserId of the document's creator.

***

### documentId

> **documentId**: `string`

***

### lastModified

> **lastModified**: `string`

ISO timestamp of when the document was last modified.

***

### permission

> **permission**: `"owner"` \| `"read-write"` \| `"reader"`

The caller's effective permission on this specific document.
App admins/owners always see `"owner"`. For other callers this resolves
via `DocumentPermissionService.resolveEffectivePermission` (direct
permission OR group-derived).

***

### tags?

> `optional` **tags**: `string`[]

Document tags (omitted when the document has no tags).

***

### title

> **title**: `string`

Document title.
