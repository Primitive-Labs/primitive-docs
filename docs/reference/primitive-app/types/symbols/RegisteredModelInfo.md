# RegisteredModelInfo

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
