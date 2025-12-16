export const PROJECTS = [
  {
    id: 'js-bao',
    type: 'typedoc',
    repoPath: 'packages/js-bao',
    entryPoints: ['packages/js-bao/src/index.ts'],
    outDir: 'docs/reference/js-bao/api',
  },
  {
    id: 'js-bao-wss-client',
    type: 'typedoc',
    repoPath: 'packages/js-bao-wss-client',
    entryPoints: ['packages/js-bao-wss-client/index.ts'],
    outDir: 'docs/reference/js-bao-wss-client/api',
  },
  {
    id: 'primitive-app',
    type: 'vue-docgen',
    repoPath: 'packages/primitive-app',
    componentsGlob: 'packages/primitive-app/src/**/*.vue',
    outDir: 'docs/reference/primitive-app/components',
  },
]


