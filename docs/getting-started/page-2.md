# Page 2 — Build & Publish

This page covers building and publishing to GitHub Pages.

## Build

This updates submodules to latest tracked `main`, regenerates reference docs, then builds VitePress:

```bash
pnpm docs:build
```

## Publish

This publishes `docs/.vitepress/dist` to the `gh-pages` branch:

```bash
pnpm docs:publish
```

In GitHub, set Pages to deploy from `gh-pages` `/ (root)`.


