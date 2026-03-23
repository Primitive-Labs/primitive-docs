[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / EnableOfflineAccessOptions

# Interface: EnableOfflineAccessOptions

Options for [JsBaoClient.enableOfflineAccess](../classes/JsBaoClient.md#enableofflineaccess).

## Properties

### allowPinFallback?

> `optional` **allowPinFallback**: `boolean`

If true, falls back to PIN-based offline access when passkey largeBlob is unavailable.

***

### pinProvider()?

> `optional` **pinProvider**: () => `Promise`\<`string`\>

Async function that prompts the user for a PIN and returns it.

#### Returns

`Promise`\<`string`\>

***

### preferBiometric?

> `optional` **preferBiometric**: `boolean`

If true, attempts passkey-based largeBlob storage before falling back to PIN.

***

### retention?

> `optional` **retention**: `object`

Controls whether offline data survives sign-out.

#### preserveOnSignOut?

> `optional` **preserveOnSignOut**: `boolean`

If true, keeps offline data when the user logs out.

***

### ttlDays?

> `optional` **ttlDays**: `number`

Number of days the offline grant remains valid before requiring online re-authentication.
