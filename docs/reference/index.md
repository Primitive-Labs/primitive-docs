# Reference

Generated reference documentation for each project.

## js-bao

### Api

- ** Media**
  - [model-autogen-plan](/reference/js-bao/api/_media/model-autogen-plan)
  - [model-migration-guide](/reference/js-bao/api/_media/model-migration-guide)
- **Classes**
  - [BaseModel](/reference/js-bao/api/classes/BaseModel)
  - [DatabaseEngine](/reference/js-bao/api/classes/DatabaseEngine)
  - [DocumentClosedError](/reference/js-bao/api/classes/DocumentClosedError)
  - [DocumentResolutionError](/reference/js-bao/api/classes/DocumentResolutionError)
  - [Logger](/reference/js-bao/api/classes/Logger)
  - [ModelRegistry](/reference/js-bao/api/classes/ModelRegistry)
  - [RecordNotFoundError](/reference/js-bao/api/classes/RecordNotFoundError)
  - [StringSet](/reference/js-bao/api/classes/StringSet)
  - [UniqueConstraintViolationError](/reference/js-bao/api/classes/UniqueConstraintViolationError)
- **Enumerations**
  - [LogLevel](/reference/js-bao/api/enumerations/LogLevel)
- **Functions**
  - [attachAndRegisterModel](/reference/js-bao/api/functions/attachAndRegisterModel)
  - [attachSchemaToClass](/reference/js-bao/api/functions/attachSchemaToClass)
  - [autoRegisterModel](/reference/js-bao/api/functions/autoRegisterModel)
  - [createModelClass](/reference/js-bao/api/functions/createModelClass)
  - [defineModelSchema](/reference/js-bao/api/functions/defineModelSchema)
  - [dumpYDocToPlain](/reference/js-bao/api/functions/dumpYDocToPlain)
  - [Field](/reference/js-bao/api/functions/Field)
  - [generateULID](/reference/js-bao/api/functions/generateULID)
  - [initJsBao](/reference/js-bao/api/functions/initJsBao)
  - [Model](/reference/js-bao/api/functions/Model)
  - [resetJsBao](/reference/js-bao/api/functions/resetJsBao)
  - [summarizePlainYDoc](/reference/js-bao/api/functions/summarizePlainYDoc)
- **Interfaces**
  - [ConnectedDocument](/reference/js-bao/api/interfaces/ConnectedDocument)
  - [DatabaseConfig](/reference/js-bao/api/interfaces/DatabaseConfig)
  - [DocumentConnectionEvent](/reference/js-bao/api/interfaces/DocumentConnectionEvent)
  - [DocumentManager](/reference/js-bao/api/interfaces/DocumentManager)
  - [DumpOptions](/reference/js-bao/api/interfaces/DumpOptions)
  - [DumpSummary](/reference/js-bao/api/interfaces/DumpSummary)
  - [DumpSummaryEntry](/reference/js-bao/api/interfaces/DumpSummaryEntry)
  - [FieldOptions](/reference/js-bao/api/interfaces/FieldOptions)
  - [InitJsBaoOptions](/reference/js-bao/api/interfaces/InitJsBaoOptions)
  - [InitJsBaoResult](/reference/js-bao/api/interfaces/InitJsBaoResult)
  - [ModelOptions](/reference/js-bao/api/interfaces/ModelOptions)
  - [PaginatedResult](/reference/js-bao/api/interfaces/PaginatedResult)
  - [PaginationOptions](/reference/js-bao/api/interfaces/PaginationOptions)
  - [QueryOptions](/reference/js-bao/api/interfaces/QueryOptions)
  - [SaveOptions](/reference/js-bao/api/interfaces/SaveOptions)
- **Type Aliases**
  - [DocumentConnectionCallback](/reference/js-bao/api/type-aliases/DocumentConnectionCallback)
  - [DocumentFilter](/reference/js-bao/api/type-aliases/DocumentFilter)
  - [DocumentPermissionHint](/reference/js-bao/api/type-aliases/DocumentPermissionHint)
  - [InferAttrs](/reference/js-bao/api/type-aliases/InferAttrs)
  - [ModelConstructor](/reference/js-bao/api/type-aliases/ModelConstructor)
  - [PlainYDoc](/reference/js-bao/api/type-aliases/PlainYDoc)
  - [ProjectionSpec](/reference/js-bao/api/type-aliases/ProjectionSpec)
  - [QueryResult](/reference/js-bao/api/type-aliases/QueryResult)
- [globals](/reference/js-bao/api/globals)
- [README](/reference/js-bao/api/README)

## js-bao-wss-client

### Api

- ** Media**
  - [LOCAL_TESTING](/reference/js-bao-wss-client/api/_media/LOCAL_TESTING)
- **Classes**
  - [JsBaoClient](/reference/js-bao-wss-client/api/classes/JsBaoClient)
  - [JsBaoError](/reference/js-bao-wss-client/api/classes/JsBaoError)
- **Functions**
  - [initializeClient](/reference/js-bao-wss-client/api/functions/initializeClient)
  - [isJsBaoError](/reference/js-bao-wss-client/api/functions/isJsBaoError)
- **Interfaces**
  - [AnalyticsAutoEventsOptions](/reference/js-bao-wss-client/api/interfaces/AnalyticsAutoEventsOptions)
  - [AnalyticsClient](/reference/js-bao-wss-client/api/interfaces/AnalyticsClient)
  - [AnalyticsEventInput](/reference/js-bao-wss-client/api/interfaces/AnalyticsEventInput)
  - [AuthStateEvent](/reference/js-bao-wss-client/api/interfaces/AuthStateEvent)
  - [BasicUserInfo](/reference/js-bao-wss-client/api/interfaces/BasicUserInfo)
  - [BlobUploadCompletedEvent](/reference/js-bao-wss-client/api/interfaces/BlobUploadCompletedEvent)
  - [BlobUploadFailedEvent](/reference/js-bao-wss-client/api/interfaces/BlobUploadFailedEvent)
  - [BlobUploadProgressEvent](/reference/js-bao-wss-client/api/interfaces/BlobUploadProgressEvent)
  - [CacheFacade](/reference/js-bao-wss-client/api/interfaces/CacheFacade)
  - [DocumentAccessResult](/reference/js-bao-wss-client/api/interfaces/DocumentAccessResult)
  - [DocumentCreateCommitFailedEvent](/reference/js-bao-wss-client/api/interfaces/DocumentCreateCommitFailedEvent)
  - [DocumentEvent](/reference/js-bao-wss-client/api/interfaces/DocumentEvent)
  - [DocumentInfo](/reference/js-bao-wss-client/api/interfaces/DocumentInfo)
  - [DocumentInvitation](/reference/js-bao-wss-client/api/interfaces/DocumentInvitation)
  - [DocumentInvitationResponse](/reference/js-bao-wss-client/api/interfaces/DocumentInvitationResponse)
  - [DocumentMetadataChangedEvent](/reference/js-bao-wss-client/api/interfaces/DocumentMetadataChangedEvent)
  - [DocumentPermissionEntry](/reference/js-bao-wss-client/api/interfaces/DocumentPermissionEntry)
  - [GeminiGenerateRawOptions](/reference/js-bao-wss-client/api/interfaces/GeminiGenerateRawOptions)
  - [GeminiGenerateResult](/reference/js-bao-wss-client/api/interfaces/GeminiGenerateResult)
  - [GeminiMessage](/reference/js-bao-wss-client/api/interfaces/GeminiMessage)
  - [GeminiModelSummary](/reference/js-bao-wss-client/api/interfaces/GeminiModelSummary)
  - [GeminiPromptOptions](/reference/js-bao-wss-client/api/interfaces/GeminiPromptOptions)
  - [GeminiStructuredOutput](/reference/js-bao-wss-client/api/interfaces/GeminiStructuredOutput)
  - [IntegrationCallRequest](/reference/js-bao-wss-client/api/interfaces/IntegrationCallRequest)
  - [IntegrationCallResponse](/reference/js-bao-wss-client/api/interfaces/IntegrationCallResponse)
  - [IntegrationsAPI](/reference/js-bao-wss-client/api/interfaces/IntegrationsAPI)
  - [InvitationEvent](/reference/js-bao-wss-client/api/interfaces/InvitationEvent)
  - [JsBaoClientOptions](/reference/js-bao-wss-client/api/interfaces/JsBaoClientOptions)
  - [JsBaoEvents](/reference/js-bao-wss-client/api/interfaces/JsBaoEvents)
  - [LlmChatOptions](/reference/js-bao-wss-client/api/interfaces/LlmChatOptions)
  - [MeUpdatedEvent](/reference/js-bao-wss-client/api/interfaces/MeUpdatedEvent)
  - [MeUpdateFailedEvent](/reference/js-bao-wss-client/api/interfaces/MeUpdateFailedEvent)
  - [NetworkModeEvent](/reference/js-bao-wss-client/api/interfaces/NetworkModeEvent)
  - [OfflineAuthEnabledEvent](/reference/js-bao-wss-client/api/interfaces/OfflineAuthEnabledEvent)
  - [OfflineAuthExpiringSoonEvent](/reference/js-bao-wss-client/api/interfaces/OfflineAuthExpiringSoonEvent)
  - [OfflineAuthFailedEvent](/reference/js-bao-wss-client/api/interfaces/OfflineAuthFailedEvent)
  - [OfflineAuthRenewedEvent](/reference/js-bao-wss-client/api/interfaces/OfflineAuthRenewedEvent)
  - [OfflineAuthUnlockedEvent](/reference/js-bao-wss-client/api/interfaces/OfflineAuthUnlockedEvent)
  - [PendingCreateCommittedEvent](/reference/js-bao-wss-client/api/interfaces/PendingCreateCommittedEvent)
  - [PendingCreateFailedEvent](/reference/js-bao-wss-client/api/interfaces/PendingCreateFailedEvent)
  - [PermissionEvent](/reference/js-bao-wss-client/api/interfaces/PermissionEvent)
  - [ReasoningOptions](/reference/js-bao-wss-client/api/interfaces/ReasoningOptions)
  - [SessionInfo](/reference/js-bao-wss-client/api/interfaces/SessionInfo)
  - [StatusChangedEvent](/reference/js-bao-wss-client/api/interfaces/StatusChangedEvent)
  - [UserProfile](/reference/js-bao-wss-client/api/interfaces/UserProfile)
- **Type Aliases**
  - [GeminiContentPart](/reference/js-bao-wss-client/api/type-aliases/GeminiContentPart)
  - [GeminiGenerateOptions](/reference/js-bao-wss-client/api/type-aliases/GeminiGenerateOptions)
  - [GeminiRole](/reference/js-bao-wss-client/api/type-aliases/GeminiRole)
  - [JsBaoErrorCode](/reference/js-bao-wss-client/api/type-aliases/JsBaoErrorCode)
  - [TypedModelConstructor](/reference/js-bao-wss-client/api/type-aliases/TypedModelConstructor)
- **Variables**
  - [initJsBao](/reference/js-bao-wss-client/api/variables/initJsBao)
- [globals](/reference/js-bao-wss-client/api/globals)
- [README](/reference/js-bao-wss-client/api/README)

## primitive-app

### Overview

- [createPrimitiveApp](/reference/primitive-app/createPrimitiveApp)

### Components

- **Components**
  - **Auth**
    - [PrimitiveLogin](/reference/primitive-app/components/components/auth/PrimitiveLogin)
    - [PrimitiveLogout](/reference/primitive-app/components/components/auth/PrimitiveLogout)
    - [PrimitiveOauthCallback](/reference/primitive-app/components/components/auth/PrimitiveOauthCallback)
  - **Documents**
    - [PrimitiveManageDocuments](/reference/primitive-app/components/components/documents/PrimitiveManageDocuments)
    - [PrimitiveShareDocumentDialog](/reference/primitive-app/components/components/documents/PrimitiveShareDocumentDialog)
    - [PrimitiveSingleDocumentSwitcher](/reference/primitive-app/components/components/documents/PrimitiveSingleDocumentSwitcher)
  - **Navigation**
    - [PrimitiveAppBreadcrumb](/reference/primitive-app/components/components/navigation/PrimitiveAppBreadcrumb)
    - [PrimitiveAppSidebarHeader](/reference/primitive-app/components/components/navigation/PrimitiveAppSidebarHeader)
    - [PrimitiveBottomNav](/reference/primitive-app/components/components/navigation/PrimitiveBottomNav)
    - [PrimitiveNavigationBadge](/reference/primitive-app/components/components/navigation/PrimitiveNavigationBadge)
    - [PrimitiveSidebarNav](/reference/primitive-app/components/components/navigation/PrimitiveSidebarNav)
    - [PrimitiveUserMenu](/reference/primitive-app/components/components/navigation/PrimitiveUserMenu)
  - **Shared**
    - [DeleteConfirmationDialog](/reference/primitive-app/components/components/shared/DeleteConfirmationDialog)
    - [PrimitiveLogoSpinner](/reference/primitive-app/components/components/shared/PrimitiveLogoSpinner)
    - [PrimitiveSkeletonGate](/reference/primitive-app/components/components/shared/PrimitiveSkeletonGate)
- **Layouts**
  - [PrimitiveAppLayout](/reference/primitive-app/components/layouts/PrimitiveAppLayout)
  - [PrimitiveLoginLayout](/reference/primitive-app/components/layouts/PrimitiveLoginLayout)
  - [PrimitiveStaticLayout](/reference/primitive-app/components/layouts/PrimitiveStaticLayout)
- **Pages**
  - [PrimitiveNotFound](/reference/primitive-app/components/pages/PrimitiveNotFound)
- [PrimitiveNotFound](/reference/primitive-app/components/PrimitiveNotFound)

### Composables

- [useJsBaoDataLoader](/reference/primitive-app/composables/useJsBaoDataLoader)
- [useTheme](/reference/primitive-app/composables/useTheme)

### Config

- [app-config](/reference/primitive-app/config/app-config)
- [env-config](/reference/primitive-app/config/env-config)
- [index](/reference/primitive-app/config/index)
- [navigation-config](/reference/primitive-app/config/navigation-config)

### Utils

- [Logger](/reference/primitive-app/utils/Logger)
