# Filing Issues from Doc Work

The single source of truth for **where and how to file a GitHub issue** when documentation
work surfaces a bug or gap. The doc skills (`docs-next-sync`, `docs-pr-sweep`,
`docs-issue-sweep`) reference this note; keep it current here rather than restating the
mechanics in each skill. STYLE.md owns the *editorial* rule ("gaps are never documented —
scope to the one language's block and file the parity bug"); this note owns the *mechanics*
of filing.

## When to file (including in unattended runs)

File an issue — **don't just describe it in the report** — whenever doc work hits something
the docs can't faithfully express on their own:

- **Parity gap** — a capability that exists in one base language only (e.g. a Swift-client
  method with no JS equivalent, or vice versa). You scope the section/example to that
  language's `{{#lang}}` block per STYLE.md **and** file the gap so the platform can close it.
- **Platform gap** — a feature reachable from one surface but not another (CLI vs Admin
  Console vs client) where a developer would reasonably expect parity.
- **Source contradiction you can't resolve** — the source says two different things, or a
  documented fact is now false and there's no clear correct value to write.

This holds **even when running unattended** (the nightly `docs-next-sync`). Filing is cheap,
reversible, and keeps the gap from being silently swallowed by a report nobody re-reads.
Filing an issue is *not* the same as documenting the gap in the docs — the docs still show
only what's there (STYLE.md).

## Where to file (repo routing)

File in the repo where the **fix** would land — the source of truth for the surface, not
this docs repo:

| Surface the gap is in | Repo |
|---|---|
| Server behavior, REST/WS API, limits, enums, defaults | `Primitive-Labs/js-bao-wss` |
| JS client API (`js-bao-wss-client`) | `Primitive-Labs/js-bao-wss` |
| Swift client — model API, auth, the codegen emitter (`SwiftEmitter.swift`), `swift-client/` | `Primitive-Labs/js-bao-wss` |
| CLI (`primitive-admin`) | `Primitive-Labs/js-bao-wss` |
| Workflows engine / step runners | `Primitive-Labs/js-bao-wss` |
| SwiftUI app package (`PrimitiveApp`: `BaoDataLoader`, app components) | `Primitive-Labs/swift-primitive-app-dev` |
| Web app template / starter (Vue/React) | `Primitive-Labs/primitive-app-dev` |

When unsure between `js-bao-wss` and `swift-primitive-app-dev` for a Swift surface: the model
API, client, auth, and emitter live in `js-bao-wss` (`swift-client/`); only the SwiftUI
framework glue (loaders, views, app state) lives in `swift-primitive-app-dev`.

## Labels and assignee

- **`ios` label** — apply whenever the issue concerns the **Swift client or iOS surface**
  (a Swift-client parity gap, an iOS-only method, a SwiftUI-package bug). This is the one
  label applied by default.
- **No other labels** unless explicitly instructed.
- **No assignee** unless explicitly instructed (then assign exactly who you're told to).

## How to file

```bash
gh issue create --repo Primitive-Labs/<repo> \
  --title "<concise, surface-first summary>" \
  --label ios \                      # only when it's the Swift client / iOS surface
  --body "$(cat <<'EOF'
## Summary
<what the gap is, in one or two sentences>

## Source
<file + symbol that proves it — e.g. swift-client/.../SwiftEmitter.swift:163>
<and, for a parity gap, the other-language counterpart that exists or is missing>

## Why it matters for docs
<the doc that couldn't be written, or the one-language fence that stays inline because of it>

## Resolution that unblocks docs
<what landing upstream would let the docs say>
EOF
)"
```

Always ground the issue in **source** (file + symbol), not just the PR summary — summaries
drift. Record the filed issue number in your run's report.

## Keeping this current

When the repo routing, the default-label convention, or the assignee policy changes, edit
**this file** — it's the one place the skills point at.
