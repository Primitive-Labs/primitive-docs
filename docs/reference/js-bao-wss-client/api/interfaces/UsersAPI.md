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

***

### getProfiles()

> **getProfiles**(`userIds`): `Promise`\<[`BatchUserProfile`](BatchUserProfile.md)[]\>

Retrieves profiles for multiple users in a single batch request.

#### Parameters

##### userIds

`string`[]

Array of user IDs to look up (max 100)

#### Returns

`Promise`\<[`BatchUserProfile`](BatchUserProfile.md)[]\>

Array of user profiles (only users that exist and belong to the app)

***

### lookup()

> **lookup**(`email`): `Promise`\<\{ `exists`: `boolean`; `user?`: \{ `email`: `string`; `name`: `string`; `userId`: `string`; \}; \}\>

Look up a user by email in the current app.

#### Parameters

##### email

`string`

Email address to look up

#### Returns

`Promise`\<\{ `exists`: `boolean`; `user?`: \{ `email`: `string`; `name`: `string`; `userId`: `string`; \}; \}\>

Object with exists boolean and optional user info
