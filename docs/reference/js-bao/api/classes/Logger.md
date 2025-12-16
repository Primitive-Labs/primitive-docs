[**js-bao**](../README.md)

***

[js-bao](../globals.md) / Logger

# Class: Logger

Defined in: [packages/js-bao/src/models/BaseModel.ts:81](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L81)

## Constructors

### Constructor

> **new Logger**(): `Logger`

#### Returns

`Logger`

## Methods

### debug()

> `static` **debug**(`message`, ...`args`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:152](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L152)

#### Parameters

##### message

`string`

##### args

...`any`[]

#### Returns

`void`

***

### error()

> `static` **error**(`message`, ...`args`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:101](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L101)

#### Parameters

##### message

`string`

##### args

...`any`[]

#### Returns

`void`

***

### getLogLevel()

> `static` **getLogLevel**(): [`LogLevel`](../enumerations/LogLevel.md)

Defined in: [packages/js-bao/src/models/BaseModel.ts:91](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L91)

#### Returns

[`LogLevel`](../enumerations/LogLevel.md)

***

### info()

> `static` **info**(`message`, ...`args`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:135](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L135)

#### Parameters

##### message

`string`

##### args

...`any`[]

#### Returns

`void`

***

### setLogCallback()

> `static` **setLogCallback**(`callback`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:95](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L95)

#### Parameters

##### callback

(`message`, `level`) => `void` | `null`

#### Returns

`void`

***

### setLogLevel()

> `static` **setLogLevel**(`level`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:87](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L87)

#### Parameters

##### level

[`LogLevel`](../enumerations/LogLevel.md)

#### Returns

`void`

***

### verbose()

> `static` **verbose**(`message`, ...`args`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:169](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L169)

#### Parameters

##### message

`string`

##### args

...`any`[]

#### Returns

`void`

***

### warn()

> `static` **warn**(`message`, ...`args`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:118](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L118)

#### Parameters

##### message

`string`

##### args

...`any`[]

#### Returns

`void`
