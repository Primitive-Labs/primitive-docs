import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, posix } from 'node:path'

const repoRoot = process.cwd()

const typesSymbolsDir = resolve(repoRoot, 'docs/reference/primitive-app/types/symbols')
const vueDocsRoot = resolve(repoRoot, 'docs/reference/primitive-app/components')

if (!existsSync(typesSymbolsDir)) {
  console.warn('[postprocess:primitive-app-vue-docs-type-links] Missing types symbols dir; skipping.')
  process.exit(0)
}
if (!existsSync(vueDocsRoot)) {
  console.warn('[postprocess:primitive-app-vue-docs-type-links] Missing vue docs dir; skipping.')
  process.exit(0)
}

async function listMdFiles(dirAbs) {
  const entries = await readdir(dirAbs, { withFileTypes: true })
  const out = []
  for (const e of entries) {
    const p = resolve(dirAbs, e.name)
    if (e.isDirectory()) out.push(...(await listMdFiles(p)))
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p)
  }
  return out
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function getSymbolNames() {
  const files = await readdir(typesSymbolsDir, { withFileTypes: true })
  return files
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md')
    .map((e) => e.name.replace(/\.md$/, ''))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length) // longest-first avoids partial overlaps
}

function linkFor(name) {
  // VitePress link (no .md)
  const relFromDocs = posix.join('reference', 'primitive-app', 'types', 'symbols', name)
  return '/' + relFromDocs
}

function linkTypesInMarkdown(md, symbolNames) {
  let out = md
  for (const name of symbolNames) {
    const href = linkFor(name)

    // Replace plain occurrences, but avoid double-linking already-marked `[Name](...)`.
    // Node 22 supports lookbehind; keep it simple but safe-ish.
    const re = new RegExp(`(?<!\\[)\\b${escapeRegExp(name)}\\b`, 'g')
    out = out.replace(re, `[${name}](${href})`)
  }
  return out
}

const symbolNames = await getSymbolNames()
if (!symbolNames.length) {
  console.warn('[postprocess:primitive-app-vue-docs-type-links] No type symbols found; skipping.')
  process.exit(0)
}

const mdFiles = await listMdFiles(vueDocsRoot)
for (const abs of mdFiles) {
  const before = await readFile(abs, 'utf-8')
  const after = linkTypesInMarkdown(before, symbolNames)
  if (after !== before) await writeFile(abs, after, 'utf-8')
}


