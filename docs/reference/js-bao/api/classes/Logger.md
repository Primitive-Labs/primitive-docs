[**js-bao**](../README.md)

***

[js-bao](../globals.md) / Logger

# Class: Logger

## Constructors

### Constructor

> **new Logger**(): `Logger`

#### Returns

`Logger`

## Methods

### debug()

> `static` **debug**(`message`, ...`args`): `void`

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

#### Returns

[`LogLevel`](../enumerations/LogLevel.md)

***

### info()

> `static` **info**(`message`, ...`args`): `void`

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

#### Parameters

##### callback

(`message`, `level`) => `void` | `null`

#### Returns

`void`

***

### setLogLevel()

> `static` **setLogLevel**(`level`): `void`

#### Parameters

##### level

[`LogLevel`](../enumerations/LogLevel.md)

#### Returns

`void`

***

### verbose()

> `static` **verbose**(`message`, ...`args`): `void`

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

#### Parameters

##### message

`string`

##### args

...`any`[]

#### Returns

`void`
