# Getting Started

This repo (`primitive-docs`) builds a unified documentation site for multiple projects by:

- Keeping editable library repos in `library_repos/**` (git submodules)
- Symlinking into `packages/**` to preserve the expected package layout
- Generating reference docs into `docs/reference/**` (**committed**)
- Serving and building the site with VitePress from `docs/`

## Prerequisites

- Node.js (latest; this repo expects Node \(\ge 22\))
- `pnpm`
- `git` (with submodules)

## Clone + initialize submodules

If you’re cloning fresh:

```bash
git clone --recurse-submodules git@github.com:Primitive-Labs/primitive-docs.git
cd primitive-docs
```

If you already cloned:

```bash
pnpm submodules:init
```

## Install dependencies (docs repo)

```bash
pnpm install
```

## Generate reference docs

This runs:

- TypeDoc for `js-bao` and `js-bao-wss-client`
- vue-docgen-cli for `primitive-app`
- Reference index + sidebar data generation

```bash
pnpm gen:reference
```

## Run the docs locally

Starts VitePress at `docs/`:

```bash
pnpm docs:dev
```

Note: if you regenerate `docs/.vitepress/generated/reference-nav.json`, restart the dev server to pick up sidebar changes.

## Build for production

Updates submodules to the latest tracked `main`, regenerates reference docs, then builds:

```bash
pnpm docs:build
```

## Publish to GitHub Pages (manual)

Builds and publishes `docs/.vitepress/dist` to the `gh-pages` branch:

```bash
pnpm docs:publish
```

In GitHub, configure Pages to deploy from `gh-pages` `/ (root)`.


