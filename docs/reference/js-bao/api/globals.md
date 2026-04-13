[**js-bao**](README.md)

***

# js-bao

## Enumerations

- [LogLevel](enumerations/LogLevel.md)

## Classes

- [BaseModel](classes/BaseModel.md)
- [DatabaseEngine](classes/DatabaseEngine.md)
- [DocumentClosedError](classes/DocumentClosedError.md)
- [DocumentResolutionError](classes/DocumentResolutionError.md)
- [Logger](classes/Logger.md)
- [ModelRegistry](classes/ModelRegistry.md)
- [RecordNotFoundError](classes/RecordNotFoundError.md)
- [StringSet](classes/StringSet.md)
- [UniqueConstraintViolationError](classes/UniqueConstraintViolationError.md)

## Interfaces

- [ConnectedDocument](interfaces/ConnectedDocument.md)
- [DatabaseConfig](interfaces/DatabaseConfig.md)
- [DiscoveredConstraint](interfaces/DiscoveredConstraint.md)
- [DiscoveredField](interfaces/DiscoveredField.md)
- [DiscoveredModel](interfaces/DiscoveredModel.md)
- [DiscoveredRelationship](interfaces/DiscoveredRelationship.md)
- [DiscoveredSchema](interfaces/DiscoveredSchema.md)
- [DocumentConnectionEvent](interfaces/DocumentConnectionEvent.md)
- [DocumentManager](interfaces/DocumentManager.md)
- [DumpOptions](interfaces/DumpOptions.md)
- [DumpSummary](interfaces/DumpSummary.md)
- [DumpSummaryEntry](interfaces/DumpSummaryEntry.md)
- [FieldOptions](interfaces/FieldOptions.md)
- [IncludeSpec](interfaces/IncludeSpec.md)
- [InitJsBaoOptions](interfaces/InitJsBaoOptions.md)
- [InitJsBaoResult](interfaces/InitJsBaoResult.md)
- [ModelOptions](interfaces/ModelOptions.md)
- [PaginatedResult](interfaces/PaginatedResult.md)
- [PaginationOptions](interfaces/PaginationOptions.md)
- [QueryOptions](interfaces/QueryOptions.md)
- [SaveOptions](interfaces/SaveOptions.md)

## Type Aliases

- [DocumentConnectionCallback](type-aliases/DocumentConnectionCallback.md)
- [DocumentFilter](type-aliases/DocumentFilter.md)
- [DocumentPermissionHint](type-aliases/DocumentPermissionHint.md)
- [InferAttrs](type-aliases/InferAttrs.md)
- [ModelConstructor](type-aliases/ModelConstructor.md)
- [PlainYDoc](type-aliases/PlainYDoc.md)
- [ProjectionSpec](type-aliases/ProjectionSpec.md)
- [QueryResult](type-aliases/QueryResult.md)

## Functions

- [attachAndRegisterModel](functions/attachAndRegisterModel.md)
- [attachSchemaToClass](functions/attachSchemaToClass.md)
- [autoRegisterModel](functions/autoRegisterModel.md)
- [clearMetaSyncCache](functions/clearMetaSyncCache.md)
- [~~createModelClass~~](functions/createModelClass.md)
- [defineModelSchema](functions/defineModelSchema.md)
- [discoverModelNames](functions/discoverModelNames.md)
- [discoverSchema](functions/discoverSchema.md)
- [dumpYDocToPlain](functions/dumpYDocToPlain.md)
- [Field](functions/Field.md)
- [generateULID](functions/generateULID.md)
- [inferFieldType](functions/inferFieldType.md)
- [initJsBao](functions/initJsBao.md)
- [loadSchemaFromToml](functions/loadSchemaFromToml.md)
- [loadSchemaFromTomlString](functions/loadSchemaFromTomlString.md)
- [Model](functions/Model.md)
- [registerFunctionDefault](functions/registerFunctionDefault.md)
- [resetJsBao](functions/resetJsBao.md)
- [schemaToToml](functions/schemaToToml.md)
- [summarizePlainYDoc](functions/summarizePlainYDoc.md)
- [syncInferredMeta](functions/syncInferredMeta.md)
- [syncModelMeta](functions/syncModelMeta.md)
