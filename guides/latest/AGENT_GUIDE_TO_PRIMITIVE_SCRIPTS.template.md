# Agent Guide to Primitive Scripts

A **script** is a sandboxed [Rhai](https://rhai.rs/) program that transforms JSON and returns JSON. Scripts are the escape hatch for data shaping too involved for a templated `transform` step — nested reshaping, derived fields, array map/filter/reduce, parsing JSON-string columns. They run inside [workflows](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md) as `script` steps.

The sandbox is **deterministic and side-effect-free**: no network, no clock, no storage, no randomness. The same input always produces the same output, so a script step is safe to retry and reproducible to test.

## The Script model

A script converges on the same shape as managed prompts:

- A **`Script`** header is a named record, unique per app, carrying an `activeConfigId`.
- Versioned **`ScriptConfig`** rows each hold a Rhai body plus that config's `limits`.
- The active body is the `ScriptConfig` that `activeConfigId` points at.

You never edit these records directly. A script body lives in your sync directory as `transforms/<name>.rhai`, where `<name>` (the filename without `.rhai`) is the script's unique name. `primitive sync push` mirrors the file to the server — creating a new `ScriptConfig` and activating it — and `primitive sync pull` writes it back. There is no separate `transforms` CLI command; scripts ride the normal sync flow.

### Live resolution at run time

The runner resolves the body **on every execution** as `step.configId || script.activeConfigId` — there is no publish-time snapshot and no fan-out. Pushing a changed `.rhai` file activates a new config, and every workflow that references the script by name picks up the new body on its **next run**, with no re-publish step.

When you need a body pinned for determinism, set `configId` on the step to bypass the active-config lookup:

```toml
[[steps]]
id = "normalize"
kind = "script"
ref = "normalize-order"     # required — the Script name (unique per app)
# configId = "..."          # optional — pin a specific ScriptConfig
saveAs = "order"
```

## Input and output

The step's `with` table is the JSON context handed to the script. Inside the script the whole table is exposed as **`input.*`** (with **`ctx.*`** as an alias) — **not** as bare top-level variables:

```toml
[[steps]]
id = "normalize"
kind = "script"
ref = "normalize-order"
saveAs = "order"
[steps.with]                # templated by the engine before the script runs
raw = "{{ steps.fetch.body }}"
currency = "{{ input.currency }}"
```

```
// transforms/normalize-order.rhai
let items = input.raw.items.filter(|i| i.qty > 0);
let total = 0.0;
for i in items { total += i.qty * i.price; }
#{
  currency: input.currency,
  itemCount: items.len(),
  total: total,
}
```

The script's return value is its last expression. Given `steps.fetch.body = { "items": [{ "sku": "a1", "qty": 2, "price": 5.0 }, { "sku": "b2", "qty": 0, "price": 9.0 }] }` and `input.currency = "USD"`, this records `steps.normalize.output = { "currency": "USD", "itemCount": 1, "total": 10.0 }`.

**Contract rules to write to:**

- **`input.*` only.** `let x = payload;` fails with `Variable not found: payload` — write `input.payload`.
- **`with` is a reserved Rhai keyword** — a script can't declare a variable named `with`.
- **Result nesting.** A script step's return value lands under `steps.<id>.output.*` (alongside `scriptMetrics` and `ok`) — unlike `transform`, whose result is the templated table directly. Wire downstream templates and `runIf` as `{{ steps.normalize.output.total }}`, not `{{ steps.normalize.total }}`.
- **Missing keys read as `()`** (Rhai unit). Test with `input.h.symbol != ()` before using a possibly-absent field.
- **`NaN`/`Infinity` can't survive JSON output** — they serialize as `null`. Return a sentinel value instead of relying on them.
- **Map key order is normalized** at serialization, so output is byte-stable regardless of insertion order.

## The `parse_json` top-level-array gotcha

`parse_json(...)` parses a JSON **object** string into a map. It is **object-only**: handed a string whose top-level JSON value is an **array**, it raises a type error that surfaces as:

```
output type mismatch: want map, got array
```

The wording is misleading — "output type" refers to what `parse_json` expected to produce (a map), **not** the script step's output. The error fires from the `parse_json` call, but because the message reads like an output-shape complaint, it's easy to misread as a problem with the script's return value even when the script clearly returns a map. A common trigger is a database or document field that stores a JSON **array** as a string (a weights array, a composition list).

Wrap the array in an object before parsing, then extract:

```
fn parse_json_array(raw) {
  if raw == () || type_of(raw) != "string" || raw == "" { return []; }
  let wrapped = parse_json("{\"a\":" + raw + "}");
  if type_of(wrapped) == "map" && type_of(wrapped.a) == "array" { return wrapped.a; }
  []
}

// let weights = parse_json_array(input.weightsJson);
```

`parse_json` on a top-level **object** string needs no workaround.

## Per-step limits

Every run is bounded. A step may **lower** the ceilings with a `limits` table; requested values are clamped at the app ceiling and never raised:

```toml
[[steps]]
id = "normalize"
kind = "script"
ref = "normalize-order"
[steps.limits]
maxOperations = 50000
maxOutputBytes = 65536
```

| Limit | Bounds |
|---|---|
| `maxOperations` | Total Rhai operations (the real CPU cap — wall time is unreliable in the sandbox) |
| `wallMsHint` | Advisory wall-time hint |
| `maxOutputBytes` | Serialized output size |
| `maxArrayLength` | Length of any output array |
| `maxObjectKeys` | Keys on any output map |
| `maxNestingDepth` | Output nesting depth |
| `maxStringSize` | Length of any output string |
| `maxCallDepth` | Rhai call-stack depth |
| `maxLogBytes` | Cumulative log output |

## Errors

Deterministic failures (the script will fail the same way every time) come back as a **non-retryable** step error, so durable retries don't re-run a guaranteed failure. Transient/transport failures throw and retry normally. The runtime **fails closed** — it never silently passes input through.

| Code | Meaning | Retryable |
|---|---|---|
| `SCRIPT_PARSE_ERROR` | Input or source JSON failed to parse | No |
| `SCRIPT_COMPILE_ERROR` | Rhai source failed to compile | No |
| `SCRIPT_TYPE_ERROR` | Type mismatch — includes the `parse_json` array gotcha above | No |
| `SCRIPT_RUNTIME_ERROR` | Arithmetic error, stack overflow, or other runtime fault | No |
| `SCRIPT_OPERATION_LIMIT` | Exceeded `maxOperations` | No |
| `SCRIPT_OUTPUT_LIMIT` | Exceeded an output size/shape cap | No |
| `SCRIPT_MEMORY_LIMIT` | Exceeded the memory ceiling | No |
| `SCRIPT_VALIDATION_ERROR` | Response failed the host-side validation guard | No |
| `SCRIPT_TIMEOUT` | The runtime call ran long enough to look hung | Yes |
| `SCRIPT_RUNTIME_UNAVAILABLE` | The script runtime was unreachable | Yes |

## Telemetry

Each execution records per-step telemetry on the run's `scriptMetrics` array — operation count, input/output byte sizes, and the pinned runtime version — visible in run detail alongside every step's input and output.

## Testing

Determinism is what makes scripts testable: same input, same output, no hidden state. Put the script in a workflow and drive it with workflow test cases — fix the input variables, run, and assert on `steps.<id>.output`:

```bash
primitive workflows tests create <workflow-id> --name "normalize: drops zero-qty" \
  --vars '{"currency":"USD"}'
primitive workflows tests run-all <workflow-id>
```

Because the sandbox has no clock, network, or randomness, a passing case stays passing — there is no flakiness to chase.

## Related

- [Workflows](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md) — the `script` step, step wiring, and the surrounding pipeline.
- [Configuration](AGENT_GUIDE_TO_PRIMITIVE_CONFIGURATION.md) — the sync loop that pushes `transforms/<name>.rhai` to the server.
