# Model File Auto-Generation Plan

## Goals
- Provide a consistent schema-first model layout without decorators or `createModelClass`.
- Keep schema objects and business logic fully developer-editable.
- Let `js-bao-codegen` own the repetitive glue (types, lint comments, registration wiring).
- Introduce a single helper (`attachAndRegisterModel`) for the common case, while preserving granular helpers for advanced flows (e.g., Scenario 16).

## Template Structure
Each model file will contain three regions:

1. **User Header**  
   ```ts
   import { BaseModel, defineModelSchema } from "js-bao";
   const someSchema = defineModelSchema({ ... });
   ```
   Developers edit schema fields, relationships, defaults, etc., directly in this section.

2. **🔥🔥 BEGIN/END AUTO HEADER 🔥🔥** (generator-owned)  
   Contents:
   - Lint suppression (`/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */`).
   - Imports for `InferAttrs`, `attachAndRegisterModel`.
   - `export type FooAttrs = InferAttrs<typeof fooSchema>;`
   - `export interface Foo extends FooAttrs, BaseModel {}`
   - (If needed) minimal empty `export class Foo extends BaseModel {}` stub when no class exists yet. On subsequent runs, the generator leaves any user-authored class outside the auto block untouched.

3. **User Class Body**  
   ```ts
   export class Foo extends BaseModel {
     constructor(...) { super(...); }
     async delete() { ... }
     static async helper() { ... }
   }
   ```
   Developers own the entire class definition and can use `this`/`super` normally.

4. **🔥🔥 BEGIN/END AUTO FOOTER 🔥🔥** (generator-owned)  
   Contents:
   - `import "./generated/Foo.relationships.d";`
   - `attachAndRegisterModel(Foo, fooSchema);`
   - Future boilerplate (e.g., logging hooks) can be added here without touching user code.

## Helper Strategy
- **New helper**: `attachAndRegisterModel(modelClass, schema)` which internally sets static metadata, calls `attachSchemaToClass`, and registers the class with the default `ModelRegistry`.
- **Existing helpers stay exported**: `attachSchemaToClass` and `autoRegisterModel`. Scenario 16 (dynamic runtime registration) can call them separately when it needs to register with a custom registry or delay registration.
- **Documentation update**: README + migration guide will show the new helper and clarify when to use the granular helpers.

## Codegen Responsibilities
1. Detect existing firecracker markers; rewrite only the auto blocks.
2. When first creating a file:
   - Emit schema placeholder (if not already provided) or assume the developer added it.
   - Insert the auto header/footer.
   - Add an empty `export class Foo extends BaseModel {}` stub in the user region if no class exists.
3. On subsequent runs:
   - Preserve all user-authored code outside the auto blocks.
   - Update imports, lint comments, relationship paths, and helper calls inside the blocks as needed.
4. Warn (or back up) if the markers are missing or tampered with.

## Programmatic Models (Scenario 16)
- Runtime-defined classes will:
  1. Call `defineModelSchema` at runtime.
  2. Declare a `class RuntimeItem extends BaseModel { ... }`.
  3. Call either `attachAndRegisterModel(RuntimeItem, runtimeItemSchema)` or, for custom behavior, `attachSchemaToClass(RuntimeItem, runtimeItemSchema)` followed by manual `ModelRegistry.registerModel(...)`.
- No decorators or `createModelClass` are required; the same helpers ensure the runtime class has `modelName`, `schema`, and registry entries.

## Deprecating `createModelClass`
- Update docs and codegen output so new models never reference `createModelClass`.
- Mark the helper as deprecated in the public API (tsdoc + console warning) once all internal usage migrates to the class-based pattern.
- Provide migration guidance that shows how to convert `createModelClass` files to the new template (schema + class + firecracker auto blocks).

## Next Steps
1. Implement the template + marker updates in `js-bao-codegen`.
2. Export the combined helper and update README/docs.
3. Run codegen across the repo to migrate existing model files.
4. Deprecate `createModelClass` and monitor Scenario 16/other runtime flows to confirm they still work with the granular helpers.
