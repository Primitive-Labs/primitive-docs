[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / createModelClass

# ~~Function: createModelClass()~~

> **createModelClass**\<`TSchema`, `TAttrs`\>(`config`): `ModelConstructor`\<`TAttrs`\>

Defined in: packages/js-bao-wss-client/node\_modules/js-bao/dist/index.d.ts:768

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
