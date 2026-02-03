[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / JsBaoEvents

# Interface: JsBaoEvents

## Properties

### auth

> **auth**: `any`

***

### auth-failed

> **auth-failed**: `object`

#### message?

> `optional` **message**: `string`

#### reason?

> `optional` **reason**: `string`

***

### auth-success

> **auth-success**: `object`

#### cause?

> `optional` **cause**: `string`

#### previousToken

> **previousToken**: `string` \| `null`

#### token

> **token**: `string`

***

### auth:logout

> **auth:logout**: `object`

***

### auth:logout:complete

> **auth:logout:complete**: `object`

***

### auth:onlineAuthRequired

> **auth:onlineAuthRequired**: `object`

***

### auth:state

> **auth:state**: [`AuthStateEvent`](AuthStateEvent.md)

***

### awareness

> **awareness**: `AwarenessEvent`

***

### blobs:upload-completed

> **blobs:upload-completed**: [`BlobUploadCompletedEvent`](BlobUploadCompletedEvent.md)

***

### blobs:upload-failed

> **blobs:upload-failed**: [`BlobUploadFailedEvent`](BlobUploadFailedEvent.md)

***

### blobs:upload-progress

> **blobs:upload-progress**: [`BlobUploadProgressEvent`](BlobUploadProgressEvent.md)

***

### connection

> **connection**: `any`

***

### connection-close

> **connection-close**: `any`

***

### connection-error

> **connection-error**: `any`

***

### documentClosed

> **documentClosed**: `DocumentClosedEvent`

***

### documentCreateCommitFailed

> **documentCreateCommitFailed**: [`DocumentCreateCommitFailedEvent`](DocumentCreateCommitFailedEvent.md)

***

### documentLoaded

> **documentLoaded**: `DocumentLoadedEvent`

***

### documentMetadataChanged

> **documentMetadataChanged**: [`DocumentMetadataChangedEvent`](DocumentMetadataChangedEvent.md)

***

### documentOpened

> **documentOpened**: [`DocumentEvent`](DocumentEvent.md)

***

### error

> **error**: `object`

#### error

> **error**: `any`

***

### invitation

> **invitation**: [`InvitationEvent`](InvitationEvent.md)

***

### meUpdated

> **meUpdated**: [`MeUpdatedEvent`](MeUpdatedEvent.md)

***

### meUpdateFailed

> **meUpdateFailed**: [`MeUpdateFailedEvent`](MeUpdateFailedEvent.md)

***

### networkMode

> **networkMode**: [`NetworkModeEvent`](NetworkModeEvent.md)

***

### offlineAuth:enabled

> **offlineAuth:enabled**: [`OfflineAuthEnabledEvent`](OfflineAuthEnabledEvent.md)

***

### offlineAuth:expiringSoon

> **offlineAuth:expiringSoon**: [`OfflineAuthExpiringSoonEvent`](OfflineAuthExpiringSoonEvent.md)

***

### offlineAuth:failed

> **offlineAuth:failed**: [`OfflineAuthFailedEvent`](OfflineAuthFailedEvent.md)

***

### offlineAuth:renewed

> **offlineAuth:renewed**: [`OfflineAuthRenewedEvent`](OfflineAuthRenewedEvent.md)

***

### offlineAuth:revoked

> **offlineAuth:revoked**: `object`

***

### offlineAuth:unlocked

> **offlineAuth:unlocked**: [`OfflineAuthUnlockedEvent`](OfflineAuthUnlockedEvent.md)

***

### pendingCreateCommitted

> **pendingCreateCommitted**: [`PendingCreateCommittedEvent`](PendingCreateCommittedEvent.md)

***

### pendingCreateFailed

> **pendingCreateFailed**: [`PendingCreateFailedEvent`](PendingCreateFailedEvent.md)

***

### permission

> **permission**: [`PermissionEvent`](PermissionEvent.md)

***

### status

> **status**: [`StatusChangedEvent`](StatusChangedEvent.md)

***

### sync

> **sync**: `SyncEvent`

***

### workflowStarted

> **workflowStarted**: [`WorkflowStartedEvent`](WorkflowStartedEvent.md)

***

### workflowStatus

> **workflowStatus**: [`WorkflowStatusEvent`](WorkflowStatusEvent.md)
