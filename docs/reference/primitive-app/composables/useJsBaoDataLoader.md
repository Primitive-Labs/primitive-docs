# useJsBaoDataLoader

Reactive data-loading composable with subscriptions and debounced reloads.

This helper centralizes a common pattern in the app:
- Wait until `documentReady` is true.
- Load data (optionally based on reactive `queryParams`).
- Subscribe to model changes and client document events to reload.

@param options Configuration describing what to load, when to load, and what to watch.
@returns A `{ data, initialDataLoaded, reload }` bundle for consumption in components.

## Exported types

### UseJsBaoDataLoaderOptions

```ts
export interface UseJsBaoDataLoaderOptions<
  Data,
  Q extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Models to subscribe to for automatic reloads after the first successful load.
   * Each model is expected to expose a `subscribe(cb) => unsubscribe` API.
   */
  subscribeTo: ModelClass[];

  /**
   * Query params that the caller can interpret however they like.
   * Accepts a plain value, a ref, or a computed.
   * `null` disables query-driven reloads.
   */
  queryParams: MaybeRefQuery<Q>;

  /**
   * Document readiness gate. While `false`, no loads will run and
   * `initialDataLoaded` will be reset to `false`.
   */
  documentReady: MaybeRefBoolean;

  /**
   * The actual data loading function. Receives the current query params directly.
   */
  loadData: (queryParams: Q | null) => Promise<Data>;

  /**
   * Optional per-instance pause flag. While true, no loads or scheduled
   * reloads will run.
   */
  pauseUpdates?: MaybeRefBoolean;

  /**
   * Whether to reload when the js-bao client emits documentLoaded or
   * documentClosed events. This handles cases where available data changes
   * due to documents syncing from server or being closed.
   * @default true
   */
  reloadOnDocumentEvents?: MaybeRefBoolean;

  /**
   * Debounce delay (ms) for scheduled reloads.
   */
  debounceMs?: number;

  /**
   * Optional error handler.
   */
  onError?: (error: unknown) => void;
}
```

### UseJsBaoDataLoaderResult

```ts
export interface UseJsBaoDataLoaderResult<Data> {
  /**
   * Latest successfully loaded data. Starts as `null`.
   */
  data: Ref<Data | null>;

  /**
   * Becomes `true` after the first successful load while `documentReady`
   * is `true`. Reset back to `false` whenever `documentReady` becomes `false`.
   */
  initialDataLoaded: Ref<boolean>;

  /**
   * Manually schedule a reload (subject to debounce, readiness, and pause).
   */
  reload: () => void;
}
```
