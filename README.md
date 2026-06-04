# primitive-docs

Source for both Primitive documentation products:

- the **docs site** — `docs/`, VitePress, published to GitHub Pages
- the **agent guides** — `guides/latest/`, fetched by `primitive guides get`

Both draw code examples from one compiled corpus (`examples/`), and everything is validated against the real platform source (git submodules under `library_repos/`). `CLAUDE.md` carries the agent-facing repo instructions; `STYLE.md` is the editorial canon.

## What skill to use when

The repo's Claude Code skills (`.claude/skills/`) drive the editorial loop. Pick by what you're trying to do:

| You're trying to… | Skill | Notes |
|---|---|---|
| Write or edit any page or guide | **docs-editorial** | The writing standards (altitude tiers, never-say rules, platform treatment). Triggers on any doc edit; `STYLE.md` is the full canon. |
| Update docs because the libraries changed | **docs-next-sync** | The continuous truing pass on `next`: scans every library commit since the last pass, triages developer relevance, updates pages and guides together. |
| Publish docs for a production release | **docs-publish-release** | Merges `next → main` at the release SHA and verifies the release summary is covered. **The only path that publishes.** |
| Review a page or a diff | **docs-page-review** | Per-page editorial review against the standards. |
| Confirm docs and guides still agree | **docs-sync-check** | Run before committing anything that touched only one side of a docs ↔ guides pair. |
| Audit the whole doc set | **docs-set-audit** | Cross-page duplication / consistency / orphan audit — the expensive pass, run occasionally. |

Rule of thumb: ordinary doc work happens on `next` (or a branch PR'd into `next`); nothing lands on `main` except through `docs-publish-release` — plus direct hotfixes to already-published pages, which then merge back into `next`.

## Branch strategy: two channels

`docs-sources.json` declares each branch's **channel** (read by `scripts/channel.mjs`), and the validation gates run against the matching surface:

| | `main` — production channel | `next` — next channel |
|---|---|---|
| Describes | the released platform | the library `main` tips |
| Submodules pinned at | the last production-release SHA | library main tips (move with each truing pass) |
| TS examples compile against | published pinned packages | built submodule packages (`examples/node_modules` shadow) |
| CLI invocations validate against | published `primitive-admin` | submodule-built CLI |
| Publishes | yes — every merge deploys | no |

Because `next`'s gates read the submodule source, work merged to a library's `main` is documentable immediately — no released-vs-merged bookkeeping. Docs for unreleased behavior simply live on `next` until the release.

## Release process

1. **Continuously, on `next`** — run `docs-next-sync`. `node scripts/stamp-sources.mjs --changes` lists every library commit since the last pass; the skill triages each one, updates the affected pages and guides, and restamps. `docs-sources.json` is the baseline: the exact library commits and package versions the docs were last trued against (mirrored into `guides.json` `builtAgainst` and the site footer).
2. **At a production release** of js-bao-wss — take the release summary (`releases/YYYY-MM-DD-<sha8>.md` in js-bao-wss) and run `docs-publish-release`. It finds the newest `next` commit whose stamp is within the release, merges it into `main`, pins the submodule at the release SHA exactly, re-pins npm packages to what the release published, restamps onto the production channel, and walks the summary as a coverage checklist. Overhang (docs for post-release library work) stays on `next` for the following release.
3. **Merging to `main` publishes** — there is no separate deploy step.

## CI

| Workflow | Trigger | What it does |
|---|---|---|
| `checks.yml` | every PR and non-main push | Resilient submodule init → `pnpm install` → build the source packages when the branch's channel is `next` → `pnpm check:examples` → site build. A separate macOS job compiles the Swift examples (the vendored swift-client needs an Apple toolchain). |
| `publish-docs.yml` | push to `main` | The same gates, plus a guard that `docs-sources.json` declares the **production** channel, then publishes the built site to `gh-pages`. |

## The gates (run locally before declaring doc work done)

```bash
pnpm check:examples        # the full drift gate (below)
npx vitepress build docs   # dead links fail the build
```

`check:examples` chains, in order: example corpus parity → TS + Swift example compilation → rendered guide builds current → `guides.json` current → every ```` ```toml ```` block validated with the CLI's own sync-push validators → every documented `primitive …` invocation validated against the channel's CLI → the source stamp matches submodule HEADs and package versions.

On `next`, after any submodule move, build the surfaces the gates read first:

```bash
pnpm build:source-packages   # js-bao, js-bao-wss-client, primitive-admin from library_repos source
```

Useful inspection: `node scripts/check-example-parity.mjs` inventories inline code fences and their language-parity classification.

## Layout

```
docs/                  VitePress site (hand-written getting-started + generated reference, committed)
guides/latest/         agent guides: *.template.md sources → rendered .ts.md/.swift.md builds + guides.json
examples/              compiled per-language example corpus (region-tagged; included by docs, substituted into guides)
library_repos/         git submodules: js-bao-wss, primitive-app-dev, swift-primitive-app-dev
packages/              symlinks into library_repos preserving the public package layout (reference generation)
scripts/               gates and generators (scripts/channel.mjs documents the channel model)
docs-sources.json      the stamp: channel + library commits + package versions docs were last trued against
STYLE.md               the editorial canon — read it before writing any doc
CLAUDE.md              agent-facing repo instructions
```

Agent guides are **built artifacts**: edit only the `*.template.md` sources and the `examples/` corpus, then `pnpm render:guides`. Never edit the rendered `.ts.md` / `.swift.md` builds.

## Setup and development

```bash
git clone --recurse-submodules git@github.com:Primitive-Labs/primitive-docs.git
cd primitive-docs
pnpm install

pnpm docs:dev      # regenerate the reference section, start the dev server
pnpm docs:build    # fast-forward submodules, regenerate reference, full site build
```

Requires Node ≥ 22 and pnpm. (`documentation-strategy.md` is the original design doc for the submodule + generated-reference architecture.)
