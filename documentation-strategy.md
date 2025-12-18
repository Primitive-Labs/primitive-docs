# Documentation Architecture & Strategy

## Goal
Create a unified documentation site for several TypeScript / Vue libraries that:
- Keeps **API and component reference docs close to code**
- Supports **hand-written guides and architectural overviews**
- Produces a **single, cohesive documentation site**
- Is **versioned, reproducible, and low-maintenance**

Libraries involved:
- `js-bao` (TypeScript library)
- `js-bao-wss-client` (TypeScript library)
- `primitive-app` (Vue 3 + TypeScript)

All libraries live in **separate repositories**.

---

## Chosen High-Level Approach

### Dedicated Documentation Repository
Create a new repo (e.g. `primitive-docs`) that:
- Hosts a **VitePress** documentation site
- Contains **overview, guides, and examples**
- Pulls in **generated reference documentation** from each library

### Git Submodules for Libraries
Each library monorepo is included as a **git submodule** under:

```
library_repos/
  js-bao/
  js-bao-wss/
  primitive-app-dev/
```

And `packages/**` contains **symlinks** into those submodules to preserve the public package layout expected by generation scripts:

```
packages/
  js-bao/            -> ../library_repos/js-bao
  js-bao-wss-client/ -> ../library_repos/js-bao-wss/src/client
  primitive-app/     -> ../library_repos/primitive-app-dev/primitive-app
```

This allows:
- Pinning docs to exact library commits
- Reproducible builds
- No need to publish docs artifacts to npm

---

## Documentation Types

### 1. Hand-Written Docs (in docs repo)
Location:
```
docs/guide/**
```

Contents:
- Getting started
- Architecture overview
- How libraries work together
- Usage examples

Written directly in Markdown and owned by the docs repo.

---

### 2. Generated Reference Docs (from library code)

Generated at build time and written to:
```
docs/reference/**
```

#### TypeScript API Docs
For:
- `js-bao`
- `js-bao-wss-client`

Tooling:
- **TypeDoc**
- **typedoc-plugin-markdown**
- **typedoc-vitepress-theme**

Output:
```
docs/reference/js-bao/api/**
docs/reference/js-bao-wss-client/api/**
```

Notes:
- API docs are generated from TS types + comments
- Entry points are detected (e.g. `src/index.ts`)
- Docs repo owns the generation step, not the libraries

---

#### Vue Component Docs
For:
- `primitive-app`

Tooling:
- **vue-docgen-cli** (uses `vue-docgen-api`)

Input:
```
packages/primitive-app/src/components/**/*.vue
```

Output:
```
docs/reference/primitive-app/components/**
```

Captures:
- Props
- Events
- Slots
- Component descriptions

---

## VitePress Integration

### File-Based Routing
Generated Markdown files under `docs/reference/**` automatically become pages.

### Reference Index
A build-time **VitePress data loader**:
- Scans `docs/reference/**`
- Builds a dynamic “Reference Index” page
- Avoids hand-maintaining navigation

---

## Generation Workflow

### Single Command Dev Flow
```bash
pnpm docs:dev
```

Which:
1. Initializes / uses submodules
2. Deletes old generated reference output
3. Regenerates:
   - TypeDoc API markdown
   - Vue component markdown
4. Starts the VitePress dev server

### Key Scripts
- `pnpm gen:reference`
- `pnpm docs:dev`
- `pnpm docs:build`

---

## Repo Responsibilities

### Docs Repo
- Owns VitePress site
- Owns generation scripts
- Owns navigation, layout, guides
- Pins submodule versions

### Library Repos
- Own code and doc comments
- No docs tooling required locally
- No dependency on VitePress

---

## Git & Versioning Strategy

- Submodules are pinned to specific commits
- Updating docs for new library versions = bump submodule pointers
- Generated reference output is **ignored by git** by default
- Optionally can be committed later if desired

---

## Why This Approach Was Chosen

### Pros
- Docs stay close to code
- One unified documentation site
- Clear separation between guides and reference
- Reproducible and CI-friendly
- No need to publish extra packages

### Tradeoffs
- Git submodules add some workflow overhead
- Requires a generation step before docs are viewable

Overall, this approach optimizes for **clarity, maintainability, and long-term scalability** across multiple TypeScript and Vue libraries.

---

## Future Extensions (Optional)
- GitHub Actions to build and publish docs
- Versioned docs per release
- Search indexing (Algolia, local search)
- Publishing docs artifacts as npm packages if submodules become painful
