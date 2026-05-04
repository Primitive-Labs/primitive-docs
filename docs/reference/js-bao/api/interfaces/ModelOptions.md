[**js-bao**](../README.md)

***

[js-bao](../globals.md) / ModelOptions

# Interface: ModelOptions

## Properties

### className?

> `optional` **className**: `string`

Optional PascalCase class name. Used by the v2 codegen to drive
generated TypeScript class names (and relationship method names that
derive from a target's class name). When absent, the v2 codegen
falls back to suffix-based singularization of `name`.

***

### name

> **name**: `string`

***

### relationships?

> `optional` **relationships**: `Record`\<`string`, `RelationshipConfig`\>

***

### uniqueConstraints?

> `optional` **uniqueConstraints**: `UniqueConstraintConfig`[]
