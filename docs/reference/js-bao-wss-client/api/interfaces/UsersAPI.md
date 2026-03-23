[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / UsersAPI

# Interface: UsersAPI

## Methods

### getBasic()

> **getBasic**(`userId`, `options?`): `Promise`\<[`BasicUserInfo`](BasicUserInfo.md)\>

Retrieves basic profile information for a user by their ID.

#### Parameters

##### userId

`string`

The unique identifier of the user to look up

##### options?

`GetUserOptions`

Controls caching and loading behavior

#### Returns

`Promise`\<[`BasicUserInfo`](BasicUserInfo.md)\>
