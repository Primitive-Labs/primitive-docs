# Migrating Decorator-Based Models to the Schema Helpers

Created: November 14, 2025  
Audience: Teams moving from `@Model`/`@Field` decorators to the
`defineModelSchema` + `createModelClass` workflow that now powers every demo
scenario.

---

## 1. Why migrate?

- **Single source of truth:** Schema fields live in one object instead of being
  duplicated across decorators, TypeScript declarations, and runtime metadata.
- **Automatic typing:** `InferAttrs<typeof schema>` derives constructor attrs,
  instance fields, relationships, and defaults with no manual `declare` noise.
- **Proxy-free runtime:** BaseModel now exposes native property accessors per
  schema field (Phase 2); schema helpers are the easiest way to ensure every
  model is wired correctly.
- **Easier codegen/tooling:** Having a predictable schema object lets codegen,
  docs, and linters read model definitions without executing decorators.

---

## 2. Before you start

1. **Update to the latest `js-bao` build** so `defineModelSchema`,
   `createModelClass`, and the accessor wiring are available. (Run `npm run build`
   at the repo root once.)
2. **Ensure tests cover the model.** Scenarios 1–23 already do this for demos;
   replicate the pattern for your app.
3. **Keep runtime parity.** Do not remove relationships, defaults, listeners, or
   custom statics yet—lift them over exactly as-is so behavior stays identical.

---

## 3. Step-by-step port

### Step 1: Move field metadata into `defineModelSchema`

```ts
const statementSchema = defineModelSchema({
  name: "statements",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    accountName: { type: "string", indexed: true, default: "" },
    // ...
  },
  options: {
    uniqueConstraints: [
      { name: "statements_unique_account", fields: ["accountNumber", "startDate"] },
    ],
    relationships: {
      // same shape you previously passed to ModelRegistry/relationships.ts
    },
  },
});
```

- Keep every bit of metadata (`type`, `default`, `indexed`, `required`,
  `relationships`, `uniqueConstraints`) that existed in decorators.
- Use helper factories (e.g. `generateULID`) directly inside `default`.

### Step 2: Infer attrs & instance typing

```ts
export type StatementAttrs = InferAttrs<typeof statementSchema>;
export interface Statement extends StatementAttrs, BaseModel {}
```

- This replaces `interface Statement extends BaseModel` + manual field
  declarations. The interface merge keeps public instance shape identical.

### Step 3: Replace the decorated class with `createModelClass`

```ts
export const Statement = createModelClass({
  schema: statementSchema,
  methods: () => ({
    get netCashFlow() {
      return this.inflows - this.outflows;
    },
  }),
  statics: (StatementClass) => ({
    async findByAccount(accountNumber: string) {
      return StatementClass.queryOne({ accountNumber });
    },
  }),
});
```

- **Methods:** Move any prototype methods/getters into the `methods` factory.
- **Statics:** Move custom statics into the `statics` factory; the helper passes
  a fully typed constructor so you can call `query`, `find`, etc.
- **Registration:** No manual `ModelRegistry.registerModel` call is required;
  the helper registers and installs field accessors automatically.

### Step 4: Update imports where needed

- Replace decorator imports (`{ Model, Field }`) with
  `{ defineModelSchema, createModelClass, InferAttrs }`.
- If compiled TypeScript complains about `new ModelConstructor`, use the
  provided `TypedModelConstructor` helper (see
  `demos/test-app/src/types/typed-model-constructor.ts`) to keep `new Model()`
  typed as your merged interface.

### Step 5: Clean up legacy decorator artifacts

- Delete `@Model` / `@Field` usage, decorator metadata, and any static schema
  caches you no longer need.
- Remove manual `declare` property lines—they are redundant once `InferAttrs`
  merges into the interface.

---

## 4. Verifying the migration

1. **Build the library:** `npm run build` (root) to ensure the new schema compiles.
2. **Run affected scenarios/tests:** For demo models,
   `(cd demos/test-app && npm run build)` exercises Scenarios 1–23.
3. **Console smoke-test:** Instantiate the new class (`new Model({ … })`), call
   `save`, `find`, `query`, relationship helpers, and confirm the properties hold
   real values (no proxies needed).
4. **Check ModelRegistry:** Ensure `ModelRegistry.getActiveModels()` still lists
   your model name and that relationships work by running the relevant scenario.

---

## 5. Dynamic/Runtime models (Scenarios 16+)

- When you register a model class manually (without `createModelClass`), make
  sure its `getSchema()` returns the same structure shown above. The registry now
  installs field accessors automatically, so `find()` results expose true
  properties even for dynamic models.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `TypeError: Cannot read properties of undefined (reading 'getSchema')` | The class doesn’t expose a `static getSchema()` returning a runtime shape. | Export the schema and set `static schema = schema; static getSchema() { return schema.buildRuntimeShape(Class); }` (or just use `createModelClass`). |
| `Property 'foo' does not exist on type 'BaseModel'` | Constructor typing still references the generic `BaseModel`. | Re-export the class as `TypedModelConstructor<Attrs>` or the helper in `demos/test-app/src/types/typed-model-constructor.ts`. |
| Data saves but `find()` returns `undefined` fields | Accessors weren’t installed (likely because the class wasn’t registered through the helper). | Either use `createModelClass` or call `BaseModel.attachFieldAccessors(YourClass, schema.fields)` after building the schema. |
| Relationships missing | Remember to copy `options.relationships` from the decorator metadata into the schema definition, then re-run codegen if you rely on generated relationship types. |

---

## 7. Rolling migration strategy

1. Convert one model at a time, starting with leaf models that have no incoming
   relationships.
2. After each conversion, re-run relevant tests and ship behind a flag if
   necessary.
3. Once all models use schemas, delete decorator utilities and document the new
   authoring style for your team.

Feel free to share back additional gotchas as you migrate so we can keep this
guide up to date. Happy porting!
