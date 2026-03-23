[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / GroupTypeConfigsAPI

# Interface: GroupTypeConfigsAPI

## Methods

### create()

> **create**(`params`): `Promise`\<[`GroupTypeConfigInfo`](GroupTypeConfigInfo.md)\>

Creates a new group type configuration.

#### Parameters

##### params

`CreateGroupTypeConfigParams`

Configuration for the new group type

#### Returns

`Promise`\<[`GroupTypeConfigInfo`](GroupTypeConfigInfo.md)\>

***

### delete()

> **delete**(`groupType`): `Promise`\<\{ `success`: `boolean`; \}\>

Deletes a group type configuration.

#### Parameters

##### groupType

`string`

The group type identifier to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### get()

> **get**(`groupType`): `Promise`\<[`GroupTypeConfigInfo`](GroupTypeConfigInfo.md)\>

Retrieves the configuration for a specific group type.

#### Parameters

##### groupType

`string`

The group type identifier to look up

#### Returns

`Promise`\<[`GroupTypeConfigInfo`](GroupTypeConfigInfo.md)\>

***

### list()

> **list**(): `Promise`\<[`GroupTypeConfigInfo`](GroupTypeConfigInfo.md)[]\>

Lists all group type configurations for the current app.

#### Returns

`Promise`\<[`GroupTypeConfigInfo`](GroupTypeConfigInfo.md)[]\>

***

### update()

> **update**(`groupType`, `params`): `Promise`\<[`GroupTypeConfigInfo`](GroupTypeConfigInfo.md)\>

Updates an existing group type configuration's rule set or auto-add-creator setting.

#### Parameters

##### groupType

`string`

The group type identifier to update

##### params

`UpdateGroupTypeConfigParams`

Fields to update on the group type configuration

#### Returns

`Promise`\<[`GroupTypeConfigInfo`](GroupTypeConfigInfo.md)\>
