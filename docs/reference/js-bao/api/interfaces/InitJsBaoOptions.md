[**js-bao**](../README.md)

***

[js-bao](../globals.md) / InitJsBaoOptions

# Interface: InitJsBaoOptions

## Properties

### databaseConfig

> **databaseConfig**: [`DatabaseConfig`](DatabaseConfig.md)

***

### models?

> `optional` **models**: *typeof* [`BaseModel`](../classes/BaseModel.md)[]

Optional array of model classes to initialize.
If not provided, the ORM will rely on models being registered
via the

#### Model

decorator (assuming they have been imported by the application).
