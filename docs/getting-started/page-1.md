# Page 1 — Local Setup

This page walks through getting the docs site running locally.

## Clone + submodules

```bash
git clone --recurse-submodules git@github.com:Primitive-Labs/primitive-docs.git
cd primitive-docs
```

If you already cloned:

```bash
pnpm submodules:init
```

## Install root deps

```bash
pnpm install
```

## Generate reference docs

```bash
pnpm gen:reference
```

## Run the site

```bash
pnpm docs:dev
```


