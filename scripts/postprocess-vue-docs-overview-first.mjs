import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = process.cwd()
const vueDocsRoot = resolve(repoRoot, 'docs/reference/primitive-app/components')

// Marker used by scripts/inject-primitive-app-component-types.mjs
const TYPES_START_MARKER = '<!-- component-types:start -->'

if (!existsSync(vueDocsRoot)) {
  console.warn('[postprocess:vue-docs-overview-first] Missing vue docs dir; skipping.')
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

function normalizeNewlines(s) {
  // Keep it readable but don't over-normalize tables/code fences.
  return s.replace(/\n{3,}/g, '\n\n')
}

function reorderOverviewFirst(md) {
  const hr = '\n---\n'
  const hrIdx = md.indexOf(hr)
  if (hrIdx === -1) return md

  const before = md.slice(0, hrIdx)
  const after = md.slice(hrIdx + hr.length)

  const firstH2Idx = before.search(/^##\s/m)
  if (firstH2Idx === -1) return md

  const titlePart = before.slice(0, firstH2Idx).trimEnd()
  const sectionsPart = before.slice(firstH2Idx).trim()

  const markerIdx = after.indexOf(TYPES_START_MARKER)
  const overviewPart = (markerIdx === -1 ? after : after.slice(0, markerIdx)).trim()
  const restPart = markerIdx === -1 ? '' : after.slice(markerIdx).trimStart()

  // If there's no overview content, leave as-is.
  if (!overviewPart) return md

  const out =
    normalizeNewlines(
      [
        titlePart,
        '',
        overviewPart,
        '',
        '---',
        '',
        sectionsPart,
        restPart ? '\n\n' + restPart : '',
      ].join('\n'),
    ).trimEnd() + '\n'

  return out
}

const mdFiles = await listMdFiles(vueDocsRoot)
let updatedCount = 0

for (const abs of mdFiles) {
  const before = await readFile(abs, 'utf-8')
  const after = reorderOverviewFirst(before)
  if (after !== before) {
    await writeFile(abs, after, 'utf-8')
    updatedCount++
  }
}

console.log(`[postprocess:vue-docs-overview-first] Updated ${updatedCount} component page(s).`)


