import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, posix } from 'node:path'
import { cleanDir } from './utils.mjs'

const repoRoot = process.cwd()
const primitiveRepo = resolve(repoRoot, 'packages/primitive-app')
const srcTypesRoot = resolve(primitiveRepo, 'src/types')

if (!existsSync(srcTypesRoot)) {
  console.warn('[gen:primitive-app-type-symbols] Missing packages/primitive-app/src/types; skipping.')
  process.exit(0)
}

const outDir = resolve(repoRoot, 'docs/reference/primitive-app/types/symbols')

async function listTsFiles(dirAbs) {
  const entries = await readdir(dirAbs, { withFileTypes: true })
  const out = []
  for (const e of entries) {
    const p = resolve(dirAbs, e.name)
    if (e.isDirectory()) out.push(...(await listTsFiles(p)))
    else if (e.isFile() && e.name.endsWith('.ts')) out.push(p)
  }
  return out
}

function findLeadingJsDocBlock(src, exportStartIdx) {
  // Include an immediately-preceding /** ... */ block when present.
  // Walk backwards from the export to skip whitespace/newlines.
  let i = exportStartIdx
  while (i > 0 && /\s/.test(src[i - 1])) i--
  if (src.slice(Math.max(0, i - 2), i) !== '*/') return null

  const start = src.lastIndexOf('/**', i)
  if (start === -1) return null
  const end = src.indexOf('*/', start)
  if (end === -1) return null
  if (end + 2 !== i) return null
  return { start, end: end + 2 }
}

function scanBalanced(src, startIdx, openChar, closeChar) {
  // Returns index *after* the matching closeChar for the first openChar encountered.
  let i = startIdx
  while (i < src.length && src[i] !== openChar) i++
  if (i >= src.length) return null

  let depth = 0
  for (; i < src.length; i++) {
    const ch = src[i]
    if (ch === openChar) depth++
    else if (ch === closeChar) {
      depth--
      if (depth === 0) return i + 1
    }
  }
  return null
}

function scanTypeAliasEnd(src, afterNameIdx) {
  // Find `=` then scan until a `;` with balanced {}, (), [], <> nesting.
  let i = afterNameIdx
  while (i < src.length && src[i] !== '=') i++
  if (i >= src.length) return null
  i++ // after '='

  let brace = 0
  let paren = 0
  let bracket = 0
  let angle = 0

  for (; i < src.length; i++) {
    const ch = src[i]
    if (ch === '{') brace++
    else if (ch === '}') brace = Math.max(0, brace - 1)
    else if (ch === '(') paren++
    else if (ch === ')') paren = Math.max(0, paren - 1)
    else if (ch === '[') bracket++
    else if (ch === ']') bracket = Math.max(0, bracket - 1)
    else if (ch === '<') angle++
    else if (ch === '>') angle = Math.max(0, angle - 1)
    else if (ch === ';' && brace === 0 && paren === 0 && bracket === 0 && angle === 0) {
      return i + 1
    }
  }
  return null
}

function extractExportedTypeSymbols(src) {
  /**
   * Very small “good enough” parser:
   * - export interface X { ... }
   * - export enum X { ... }
   * - export type X = ...;
   */
  const re = /\bexport\s+(?:declare\s+)?(?:(?:const\s+)?enum|interface|type)\s+([A-Za-z_$][\w$]*)/g
  const symbols = []

  for (let m; (m = re.exec(src)); ) {
    const name = m[1]
    const exportStart = m.index
    const kindChunk = src.slice(m.index, m.index + 40)
    const isInterface = /\binterface\b/.test(kindChunk)
    const isEnum = /\benum\b/.test(kindChunk)
    const isType = /\btype\b/.test(kindChunk)

    let end = null
    const afterNameIdx = re.lastIndex

    if (isInterface || isEnum) {
      end = scanBalanced(src, afterNameIdx, '{', '}')
    } else if (isType) {
      end = scanTypeAliasEnd(src, afterNameIdx)
    }

    if (!end) continue

    const jsDoc = findLeadingJsDocBlock(src, exportStart)
    const start = jsDoc?.start ?? exportStart
    const snippet = src.slice(start, end).trim()
    if (!snippet) continue

    symbols.push({ name, snippet, exportStart })
  }

  // Keep deterministic ordering based on first appearance.
  symbols.sort((a, b) => a.exportStart - b.exportStart)
  return symbols
}

function mdForSymbol({ name, snippet, relFromRepoRoot }) {
  return [
    `# ${name}`,
    '',
    '```ts',
    snippet,
    '```',
    '',
  ].join('\n')
}

await cleanDir(outDir)

const typeFiles = (await listTsFiles(srcTypesRoot)).sort((a, b) => a.localeCompare(b))
const all = []

for (const abs of typeFiles) {
  const relFromRepoRoot = posix.join(
    'packages/primitive-app/src/types',
    abs.slice(srcTypesRoot.length + 1).replaceAll('\\', '/')
  )
  const src = await readFile(abs, 'utf-8')
  const symbols = extractExportedTypeSymbols(src)
  for (const sym of symbols) {
    const outPath = resolve(outDir, `${sym.name}.md`)
    await mkdir(resolve(outPath, '..'), { recursive: true })
    await writeFile(outPath, mdForSymbol({ ...sym, relFromRepoRoot }), 'utf-8')
    all.push({ name: sym.name, relFromRepoRoot })
  }
}

// Simple index page for discoverability.
const indexLines = ['# Types (symbols)', '', 'Generated symbol-level pages for `primitive-app` exported types.', '']
all.sort((a, b) => a.name.localeCompare(b.name))
for (const it of all) indexLines.push(`- [${it.name}](./${it.name})`)
indexLines.push('')
await writeFile(resolve(outDir, 'index.md'), indexLines.join('\n'), 'utf-8')


