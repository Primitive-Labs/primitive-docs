import { defineConfig } from 'vitepress'
import { readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEV_DOCS = resolve(__dirname, '..')

// Curated order; any *.md not listed here is appended alphabetically. Pages are
// only linked if the file actually exists, so the sidebar grows with the corpus
// during the build-out (no dead links).
const ORDER = [
  // Documents & data
  'documents', 'document-blob', 'model-surface', 'collections',
  'databases', 'database-type-configs',
  // People & access
  'me', 'users', 'groups', 'group-type-configs', 'collection-type-configs',
  'invitations', 'rule-sets',
  // Auth & session
  'auth', 'session',
  // Storage
  'blob-buckets',
  // Automation & AI
  'workflows', 'prompts', 'integrations', 'cron-triggers', 'gemini', 'llm',
  // Client infra
  'analytics', 'events', 'cache', 'errors',
]

function sidebar() {
  const files = readdirSync(DEV_DOCS)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .map((f) => f.replace(/\.md$/, ''))
  const ordered = [
    ...ORDER.filter((s) => files.includes(s)),
    ...files.filter((s) => !ORDER.includes(s)).sort(),
  ]
  return [
    {
      text: 'Developer Reference',
      items: [
        { text: 'Overview', link: '/' },
        ...ordered.map((s) => ({
          text: s,
          link: `/${s}`,
        })),
      ],
    },
  ]
}

export default defineConfig({
  base: '/primitive-dev/',
  title: 'Primitive Dev Reference',
  description:
    'Exhaustive, compile-verified dual-language (JavaScript + Swift) cookbook for the full js-bao client surface. Developer reference — not the human-facing docs.',
  // This reference is built incrementally and sub-API pages cross-link (and link
  // out to the main docs site) before every target exists. The compile gate is
  // what guarantees correctness here, so don't fail the build on cross-refs.
  ignoreDeadLinks: true,
  // Keep this site decoupled from the published getting-started docs.
  themeConfig: {
    nav: [
      { text: 'Getting Started Docs', link: '/primitive-docs/' },
    ],
    sidebar: sidebar(),
    outline: { level: [2, 3] },
    search: { provider: 'local' },
  },
})
