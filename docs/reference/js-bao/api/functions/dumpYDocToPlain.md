[**js-bao**](../README.md)

***

[js-bao](../globals.md) / dumpYDocToPlain

# Function: dumpYDocToPlain()

> **dumpYDocToPlain**(`yDoc`, `options`): [`PlainYDoc`](../type-aliases/PlainYDoc.md)

Defined in: [packages/js-bao/src/utils/yDocDump.ts:52](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/utils/yDocDump.ts#L52)

Dumps a js-bao-shaped Y.Doc into a plain object:
{
  [modelName]: {
    [recordId]: { ...fields },
    ...
  },
  ...
}

- By default ignores internal unique-index maps (`_uniqueIdx_*`); pass
  `{ includeIndexes: true }` to include them.
- Converts each record's nested Y.Map to a plain object.
- Leaves StringSet fields as the stored `{ value: true }` map.

## Parameters

### yDoc

`Doc`

### options

[`DumpOptions`](../interfaces/DumpOptions.md) = `{}`

## Returns

[`PlainYDoc`](../type-aliases/PlainYDoc.md)
