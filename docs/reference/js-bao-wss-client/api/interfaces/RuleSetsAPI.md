[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / RuleSetsAPI

# Interface: RuleSetsAPI

## Methods

### create()

> **create**(`params`): `Promise`\<[`RuleSetInfo`](RuleSetInfo.md)\>

Creates a new rule set with the given name, resource type, and rules.

#### Parameters

##### params

`CreateRuleSetParams`

Configuration for the new rule set

#### Returns

`Promise`\<[`RuleSetInfo`](RuleSetInfo.md)\>

***

### debug()

> **debug**(`data`): `Promise`\<[`RuleSetDebugResult`](RuleSetDebugResult.md)\>

Debugs rule evaluation for a real user, returning the full evaluation trace and context.

#### Parameters

##### data

`DebugRuleSetParams`

Parameters identifying the user, group, and operation to debug

#### Returns

`Promise`\<[`RuleSetDebugResult`](RuleSetDebugResult.md)\>

***

### delete()

> **delete**(`ruleSetId`): `Promise`\<\{ `success`: `boolean`; \}\>

Deletes a rule set by its ID.

#### Parameters

##### ruleSetId

`string`

The unique identifier of the rule set to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### get()

> **get**(`ruleSetId`): `Promise`\<[`RuleSetInfo`](RuleSetInfo.md)\>

Retrieves a single rule set by its ID.

#### Parameters

##### ruleSetId

`string`

The unique identifier of the rule set to retrieve

#### Returns

`Promise`\<[`RuleSetInfo`](RuleSetInfo.md)\>

***

### list()

> **list**(`options?`): `Promise`\<[`RuleSetInfo`](RuleSetInfo.md)[]\>

Lists rule sets, optionally filtered by resource type.

#### Parameters

##### options?

`ListRuleSetsOptions`

Filtering options for listing rule sets

#### Returns

`Promise`\<[`RuleSetInfo`](RuleSetInfo.md)[]\>

***

### schema()

> **schema**(): `Promise`\<[`RuleSetSchema`](RuleSetSchema.md)\>

Retrieves the rule set schema describing available resource types.

#### Returns

`Promise`\<[`RuleSetSchema`](RuleSetSchema.md)\>

***

### test()

> **test**(`ruleSetId`, `data`): `Promise`\<[`RuleSetTestResult`](RuleSetTestResult.md)\>

Evaluates a rule set against a simulated request and returns the access decision.

#### Parameters

##### ruleSetId

`string`

The unique identifier of the rule set to test

##### data

`TestRuleSetParams`

Simulated request parameters for rule evaluation

#### Returns

`Promise`\<[`RuleSetTestResult`](RuleSetTestResult.md)\>

***

### update()

> **update**(`ruleSetId`, `params`): `Promise`\<[`RuleSetInfo`](RuleSetInfo.md)\>

Updates a rule set's name, description, or rules.

#### Parameters

##### ruleSetId

`string`

The unique identifier of the rule set to update

##### params

`UpdateRuleSetParams`

Fields to update on the rule set

#### Returns

`Promise`\<[`RuleSetInfo`](RuleSetInfo.md)\>
