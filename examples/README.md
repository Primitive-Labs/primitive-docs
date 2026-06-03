# Example corpus

Single source of truth for the code examples used in **both** the human docs
(`docs/`) and the agent guides (`guides/`). Each example is written once per
**language** and pulled into the guides — never hand-copied.

## Layout

```
examples/
  <subject>/
    <operation>.ts          # JavaScript / TypeScript (all platforms)
    <operation>.swift       # Swift (all platforms)
    <operation>.ios.swift   # optional swift_ios platform override
```

The logical id of an example is `<subject>/<operation>` (extension and any
platform infix stripped). `documents/list-shared.ts` and
`documents/list-shared.swift` are the **same example** in two languages.

## Contract (enforced by `scripts/examples.mjs`)

1. **Base-language parity.** Every example id must exist in every base
   language declared in `scripts/variants.mjs` (today `ts` + `swift`). This is
   the parity guarantee — and the mechanism that surfaces API-shape drift
   between clients: if an operation can't be written the same way in both, you
   find out at check time.
2. **One transcludable region.** Each file (base or override) has exactly one
   `// #region example` … `// #endregion example` block. That region is what
   the docs pull in. Everything outside it (imports, setup, comments) is context
   that doesn't ship.
3. **Platform overrides are optional and declared.** A platform infix before
   the extension (`oauth.ios.swift`) marks a platform-specific override. The
   infix must be a platform token from `scripts/variants.mjs`, and the
   resulting (language, platform) pair must match a declared variant —
   anything else fails the check (typo guard).

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

All variants of an example share the **same** code-group: when a platform
override exists, add another hand-authored include line with the variant's tab
label from `scripts/variants.mjs` (e.g.
`<<< ../../examples/auth/oauth.ios.swift#example{swift} [Swift (iOS)]`).

**Agent guides (`guides/`).** Served as static, single-variant markdown by
`primitive guides get`, so they can't transclude at serve time. Each
`AGENT_GUIDE_TO_PRIMITIVE_<TOPIC>.template.md` carries
`{{ example: <subject>/<operation> }}` placeholders, and `pnpm render:guides`
renders one committed build per declared variant
(`scripts/render-guides.mjs`). There is also a legacy marker-injection form,
kept working but unused by current guides:

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

## Variants: language × platform

Language and platform are **independent dimensions**, modeled by the variant
registry in `scripts/variants.mjs` — the single source of truth for which
builds exist. Examples are keyed by language, with **optional per-platform
overrides**: iOS and macOS are both Swift and share one `.swift` file until a
platform genuinely diverges, at which point an override file
(`<operation>.ios.swift`) carries the platform-specific version. When a
variant build renders, the override wins and the base-language file is the
fallback — so overrides exist only where platforms actually differ.

A variant declares an `id` (used only locally, as the built-guide filename
suffix `AGENT_GUIDE_TO_PRIMITIVE_<TOPIC>.<id>.md`), a `language`, an optional
`platform`, the markdown fence, the human-docs tab label, and its compile
harness. Today two variants are declared (`ts`, `swift`, both
platform-agnostic); adding e.g. `swift_ios` is one registry entry plus optional
override files — no script changes.

`guides/latest/guides.json` is the manifest the CLI consumes: each guide lists
its builds under `variants[]` as `{ language?, platform?, file }` (an omitted
dimension means agnostic), with top-level `defaults` and a per-guide default
`file`. The CLI picks: exact (language, platform) match → language-only →
platform-only → `file`.

## Keeping fixtures + clients current

The pinned client versions live in this project's `devDependencies`; bump them
in lockstep with the vendored submodule when it advances, and the compile gate
re-verifies every snippet against the new surface. Regenerate the fixture models
with `pnpm gen:example-models` after editing `_harness/schema.toml` (the
generated output is gitignored and rebuilt by the gate).
