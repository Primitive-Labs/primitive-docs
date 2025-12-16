[**js-bao**](../README.md)

***

[js-bao](../globals.md) / createModelClass

# ~~Function: createModelClass()~~

> **createModelClass**\<`TSchema`, `TAttrs`\>(`config`): [`ModelConstructor`](../type-aliases/ModelConstructor.md)\<`TAttrs`\>

Defined in: [packages/js-bao/src/models/schema.ts:122](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/schema.ts#L122)

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
