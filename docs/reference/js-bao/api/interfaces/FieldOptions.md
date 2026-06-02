[**js-bao**](../README.md)

***

[js-bao](../globals.md) / FieldOptions

# Interface: FieldOptions

## Properties

### autoAssign?

> `optional` **autoAssign**: `boolean`

***

### autoStamp?

> `optional` **autoStamp**: `"create"` \| `"update"` \| `"both"`

Auto-timestamp this field with `Date.now()` (milliseconds) on save.

- `'create'` — stamp only on the first save (when `isNew === true`).
- `'update'` — stamp on every save (create AND update).
- `'both'`   — stamp on every save (create AND update).

If the caller passes an explicit value for the field in `data`, the
explicit value wins and the stamp is skipped. The stamp is applied
in `beforeSave` BEFORE any user-defined hooks, so user hooks may
still overwrite the value if they wish (last writer wins).

***

### default?

> `optional` **default**: `any`

***

### enum?

> `optional` **enum**: `string`[]

Allowed-value set for a `string` field. When present, the codegen
generators (database-type codegen + doc-model v2 codegen) emit a
TypeScript string-literal union (`"a" | "b" | "c"`) instead of a bare
`string` for this field.

Advisory / codegen-only: this is a TS-emission hint. The runtime and the
server do NOT enforce enum membership on write (see #843). Only valid on
`string` fields, and must be a non-empty array of strings.

***

### indexed?

> `optional` **indexed**: `boolean`

***

### maxCount?

> `optional` **maxCount**: `number`

***

### maxLength?

> `optional` **maxLength**: `number`

***

### required?

> `optional` **required**: `boolean`

***

### type

> **type**: `FieldType`

***

### unique?

> `optional` **unique**: `boolean`
