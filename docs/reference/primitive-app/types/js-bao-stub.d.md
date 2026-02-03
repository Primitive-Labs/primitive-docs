# js-bao-stub.d

## Exported types

### RegisteredModelInfo

```ts
export interface RegisteredModelInfo {
    class: typeof BaseModel;
    fields: Map<string, Record<string, any>>;
    options: {
      name: string;
      uniqueConstraints?: Array<{ name: string; fields: string[] }>;
      relationships?: Record<string, any>;
      [key: string]: any;
    };
  }
```

### DefinedModelSchema

```ts
export interface DefinedModelSchema {
    [key: string]: any;
  }
```

### InferAttrs

```ts
export type InferAttrs<TSchema> = any;
```
