[**js-bao**](../README.md)

***

[js-bao](../globals.md) / InitJsBaoOptions

# Interface: InitJsBaoOptions

Defined in: [packages/js-bao/src/initialize.ts:30](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L30)

## Properties

### databaseConfig

> **databaseConfig**: [`DatabaseConfig`](DatabaseConfig.md)

Defined in: [packages/js-bao/src/initialize.ts:31](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L31)

***

### models?

> `optional` **models**: *typeof* [`BaseModel`](../classes/BaseModel.md)[]

Defined in: [packages/js-bao/src/initialize.ts:37](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L37)

Optional array of model classes to initialize.
If not provided, the ORM will rely on models being registered
via the

#### Model

decorator (assuming they have been imported by the application).
