[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / JsBaoEvents

# Interface: JsBaoEvents

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:416](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L416)

## Properties

### auth

> **auth**: `any`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:420](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L420)

***

### auth-failed

> **auth-failed**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:426](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L426)

#### message?

> `optional` **message**: `string`

#### reason?

> `optional` **reason**: `string`

***

### auth-success

> **auth-success**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:421](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L421)

#### cause?

> `optional` **cause**: `string`

#### previousToken

> **previousToken**: `string` \| `null`

#### token

> **token**: `string`

***

### auth:logout

> **auth:logout**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:429](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L429)

***

### auth:logout:complete

> **auth:logout:complete**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:430](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L430)

***

### auth:onlineAuthRequired

> **auth:onlineAuthRequired**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:428](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L428)

***

### auth:state

> **auth:state**: [`AuthStateEvent`](AuthStateEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:427](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L427)

***

### awareness

> **awareness**: `AwarenessEvent`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:446](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L446)

***

### blobs:upload-completed

> **blobs:upload-completed**: [`BlobUploadCompletedEvent`](BlobUploadCompletedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:448](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L448)

***

### blobs:upload-failed

> **blobs:upload-failed**: [`BlobUploadFailedEvent`](BlobUploadFailedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:449](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L449)

***

### blobs:upload-progress

> **blobs:upload-progress**: [`BlobUploadProgressEvent`](BlobUploadProgressEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:447](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L447)

***

### connection

> **connection**: `any`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:437](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L437)

***

### connection-close

> **connection-close**: `any`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:439](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L439)

***

### connection-error

> **connection-error**: `any`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:438](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L438)

***

### documentClosed

> **documentClosed**: `DocumentClosedEvent`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:441](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L441)

***

### documentCreateCommitFailed

> **documentCreateCommitFailed**: [`DocumentCreateCommitFailedEvent`](DocumentCreateCommitFailedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:450](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L450)

***

### documentLoaded

> **documentLoaded**: `DocumentLoadedEvent`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:440](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L440)

***

### documentMetadataChanged

> **documentMetadataChanged**: [`DocumentMetadataChangedEvent`](DocumentMetadataChangedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:443](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L443)

***

### documentOpened

> **documentOpened**: [`DocumentEvent`](DocumentEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:442](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L442)

***

### error

> **error**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:417](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L417)

#### error

> **error**: `any`

***

### invitation

> **invitation**: [`InvitationEvent`](InvitationEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:455](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L455)

***

### meUpdated

> **meUpdated**: [`MeUpdatedEvent`](MeUpdatedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:453](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L453)

***

### meUpdateFailed

> **meUpdateFailed**: [`MeUpdateFailedEvent`](MeUpdateFailedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:454](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L454)

***

### networkMode

> **networkMode**: [`NetworkModeEvent`](NetworkModeEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:419](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L419)

***

### offlineAuth:enabled

> **offlineAuth:enabled**: [`OfflineAuthEnabledEvent`](OfflineAuthEnabledEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:431](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L431)

***

### offlineAuth:expiringSoon

> **offlineAuth:expiringSoon**: [`OfflineAuthExpiringSoonEvent`](OfflineAuthExpiringSoonEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:436](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L436)

***

### offlineAuth:failed

> **offlineAuth:failed**: [`OfflineAuthFailedEvent`](OfflineAuthFailedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:433](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L433)

***

### offlineAuth:renewed

> **offlineAuth:renewed**: [`OfflineAuthRenewedEvent`](OfflineAuthRenewedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:434](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L434)

***

### offlineAuth:revoked

> **offlineAuth:revoked**: `object`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:435](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L435)

***

### offlineAuth:unlocked

> **offlineAuth:unlocked**: [`OfflineAuthUnlockedEvent`](OfflineAuthUnlockedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:432](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L432)

***

### pendingCreateCommitted

> **pendingCreateCommitted**: [`PendingCreateCommittedEvent`](PendingCreateCommittedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:451](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L451)

***

### pendingCreateFailed

> **pendingCreateFailed**: [`PendingCreateFailedEvent`](PendingCreateFailedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:452](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L452)

***

### permission

> **permission**: [`PermissionEvent`](PermissionEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:444](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L444)

***

### status

> **status**: [`StatusChangedEvent`](StatusChangedEvent.md)

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:418](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L418)

***

### sync

> **sync**: `SyncEvent`

Defined in: [packages/js-bao-wss-client/JsBaoClient.ts:445](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/JsBaoClient.ts#L445)
