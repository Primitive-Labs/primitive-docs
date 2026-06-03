# Example corpus

Single source of truth for the code examples used in **both** the human docs
(`docs/`) and the agent guides (`guides/`). Each example is written once per
**language** and pulled into the guides — never hand-copied.

## Layout

```
examples/
  <subject>/
    <operation>.ts       # JavaScript / TypeScript
    <operation>.swift    # Swift
```

The logical id of an example is `<subject>/<operation>` (extension stripped).
`documents/list-shared.ts` and `documents/list-shared.swift` are the **same
example** in two languages.

## Contract (enforced by `scripts/examples.mjs`)

1. **Full language parity.** Every example id must exist in every required
   language (default `ts` + `swift`). This is the parity guarantee — and the
   mechanism that surfaces API-shape drift between clients: if an operation
   can't be written the same way in both, you find out at check time.
2. **One transcludable region.** Each file has exactly one
   `// #region example` … `// #endregion example` block. That region is what
   the docs pull in. Everything outside it (imports, setup, comments) is context
   that doesn't ship.

## How each tree consumes the corpus

**Human docs (`docs/`, VitePress).** Transcluded at build time with native
`<<<` snippet imports inside a `::: code-group`, so the reader flips between
JavaScript / Swift tabs. The page source carries no code — just include
directives. Example:

```md
::: code-group
<<< ../../examples/documents/list-shared.ts#example{ts} [JavaScript]
<<< ../../examples/documents/list-shared.swift#example{swift} [Swift]
:::
```

**Agent guides (`guides/`).** Served as static, single-language markdown by
`primitive guides get`, so they can't transclude at serve time. Instead the
corpus code is **injected** into marked regions of the committed guide:

```md
<!-- example:start documents/list-shared lang=ts -->
```typescript
…injected from examples/documents/list-shared.ts…
```
<!-- example:end -->
```

`pnpm sync:examples` writes the injections; `pnpm check:examples` (CI) verifies
the guides are in sync with the corpus and fails on drift or a missing language.

## Compilation (examples stand on their own)

Every example file is a **complete, self-contained module** — real imports + a
typed function — so it compiles on its own. What the docs show is the
`#region example` slice of a file that genuinely type-checks. A snippet that
calls a non-existent client method or passes the wrong shape **fails the build.**

- **TypeScript** type-checks against the published clients the docs target,
  installed as devDependencies of this project: `js-bao-wss-client@2.0.0`
  (client surface) and `js-bao@0.5.1` (the `BaseModel` model API) — the exact
  versions vendored in `library_repos/js-bao-wss`. Model classes (`Task`, …) are
  generated from `_harness/schema.toml` by `js-bao-codegen-v2` into
  `_harness/generated/ts/` and imported by the snippets.
- **Swift** compiles against the vendored `swift-client` package (consumed by
  path, never modified) with `swift-bao-codegen` generating model structs from
  the same `schema.toml` — mirroring the client's own `E2EMiniApp` target.
- Framework-glue snippets (Vue `useJsBaoDataLoader` / Pinia, SwiftUI
  `BaoDataLoader`) depend on app-template types not present here; those carry a
  `// nocompile` line and are reported as skipped, not silently passed.

## Commands

```bash
pnpm gen:example-models   # (re)generate fixture model classes from _harness/schema.toml
pnpm compile:examples     # type-check every TS example against the real clients
pnpm sync:examples        # inject corpus code into agent-guide regions (writes)
pnpm check:examples       # CI gate: parity + guides-in-sync + TS compile (non-zero on drift)
```

## Language vs. platform

Examples are keyed by **language**, not platform — iOS and macOS are both Swift,
so they share one `.swift` file. The eventual agent fetch facet is `--lang`
(`ts` | `swift`), and a platform maps to a language for defaulting:

| Platform (`primitive init --platform`) | Example language |
|---|---|
| `web` | `ts` |
| `ios`, `macos` | `swift` |

Today the served agent guide is single-language (the canonical
`AGENT_GUIDE_TO_PRIMITIVE_<TOPIC>.md` carries the `ts` injection). **Per-language
serving** — e.g. a generated `AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.swift.md` and
`primitive guides get documents --lang swift` — is a **separate, follow-up
change** that lives in the CLI (the `js-bao-wss` checkout, not this repo): the
CLI needs a `--lang` flag and a persisted `language`/platform signal in the
project config (`primitive.json` / `.primitive/config.json` does not store one
today). The corpus already carries both languages, so once that lands the swift
guides are a render step away.

## Keeping fixtures + clients current

The pinned client versions live in this project's `devDependencies`; bump them
in lockstep with the vendored submodule when it advances, and the compile gate
re-verifies every snippet against the new surface. Regenerate the fixture models
with `pnpm gen:example-models` after editing `_harness/schema.toml` (the
generated output is gitignored and rebuilt by the gate).
