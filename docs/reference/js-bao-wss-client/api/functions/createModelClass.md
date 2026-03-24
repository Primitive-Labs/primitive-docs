[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / createModelClass

# ~~Function: createModelClass()~~

> **createModelClass**\<`TSchema`, `TAttrs`\>(`config`): `ModelConstructor`\<`TAttrs`\>

## Type Parameters

### TSchema

`TSchema` *extends* `DefinedModelSchema`\<`any`\>

### TAttrs

`TAttrs` *extends* `Record`\<`string`, `any`\> = [`InferAttrs`](../type-aliases/InferAttrs.md)\<`TSchema`\>

## Parameters

### config

`CreateModelClassConfig`\<`TSchema`, `TAttrs`\>

## Returns

`ModelConstructor`\<`TAttrs`\>

## Deprecated

Use defineModelSchema + class + attachAndRegisterModel instead.
