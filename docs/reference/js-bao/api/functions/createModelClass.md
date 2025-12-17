[**js-bao**](../README.md)

***

[js-bao](../globals.md) / createModelClass

# ~~Function: createModelClass()~~

> **createModelClass**\<`TSchema`, `TAttrs`\>(`config`): [`ModelConstructor`](../type-aliases/ModelConstructor.md)\<`TAttrs`\>

## Type Parameters

### TSchema

`TSchema` *extends* `DefinedModelSchema`\<`any`\>

### TAttrs

`TAttrs` *extends* `Record`\<`string`, `any`\> = [`InferAttrs`](../type-aliases/InferAttrs.md)\<`TSchema`\>

## Parameters

### config

`CreateModelClassConfig`\<`TSchema`, `TAttrs`\>

## Returns

[`ModelConstructor`](../type-aliases/ModelConstructor.md)\<`TAttrs`\>

## Deprecated

Use defineModelSchema + class + attachAndRegisterModel instead.
