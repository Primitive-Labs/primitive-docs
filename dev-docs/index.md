# Primitive Developer Reference

An **exhaustive, compile-verified, dual-language** cookbook for the entire `js-bao` client
surface — one page per sub-API, an example for every public method, in **JavaScript and Swift**
side by side.

This is intentionally **separate from the [getting-started docs](/primitive-docs/)**. Those are
tutorial-style and human-readable; this is dense reference that covers every conceivable sub-API
without cluttering the main docs.

## How to read this

- Every snippet is a slice of a **complete module that type-checks against the real clients**
  (`js-bao-wss-client` / `js-bao` for TS; the vendored `swift-client` for Swift). A snippet that
  called a non-existent method or passed the wrong shape would fail the build — so what you see
  compiles.
- Each method shows a `JavaScript | Swift` tab group. Click **Swift** to flip.

## When a method isn't in both languages

The two clients aren't at full parity. Where they differ, the page says so explicitly:

::: danger No Swift equivalent
The method exists in the JavaScript client but **not** the Swift client (or vice-versa) — an
unintentional gap. The available language is shown; the gap links to the tracking issue.
:::

::: warning Intentional / deferred
Both clients differ **on purpose** — a deliberate Swift-idiomatic shape, a native-track deferral,
or a documented skip (deprecated / superseded). Not a gap to fix; the reason is stated inline.
:::

::: tip Divergent shape
Both clients have the method, but the Swift signature/return diverges (often a typed Swift struct
where JS takes an inline object). Both compile; the difference is flagged inline.
:::

## Build & verify

```bash
pnpm dev-docs:dev            # serve this site locally
pnpm compile:dev-examples    # type-check every snippet (ts + swift) against the real clients
```
