import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, posix, relative } from 'node:path'
import { existsSync } from 'node:fs'
import { cleanDir } from './utils.mjs'

const repoRoot = process.cwd()
const primitiveRepo = resolve(repoRoot, 'packages/primitive-app')
const srcRoot = resolve(primitiveRepo, 'src')

if (!existsSync(srcRoot)) {
  console.warn('[gen:primitive-app-ts] Missing packages/primitive-app/src; skipping.')
  process.exit(0)
}

const outBase = resolve(repoRoot, 'docs/reference/primitive-app')

async function listTsFiles(dirAbs) {
  const entries = await readdir(dirAbs, { withFileTypes: true })
  const out = []
  for (const e of entries) {
    const p = resolve(dirAbs, e.name)
    if (e.isDirectory()) {
      out.push(...(await listTsFiles(p)))
    } else if (e.isFile() && e.name.endsWith('.ts')) {
      out.push(p)
    }
  }
  return out
}

function mdForTs(relFromRepoRoot) {
  const title = relFromRepoRoot.split('/').pop()?.replace(/\.ts$/, '') ?? relFromRepoRoot
  return `# ${title}\n\n\`\`\`ts\n<<< ${relFromRepoRoot}\n\`\`\`\n`
}

function toPosixPath(p) {
  return p.replaceAll('\\', '/')
}

function extractLeadingJsDocForExportedFunction(src, fnName) {
  // Find `export function fnName` and capture an immediately preceding /** ... */ block.
  const re = new RegExp(`(^|\\n)\\s*export\\s+function\\s+${fnName}\\b`, 'm')
  const m = re.exec(src)
  if (!m) return null
  const exportIdx = m.index + (m[1] ? m[1].length : 0)

  // Walk backwards over whitespace
  let i = exportIdx
  while (i > 0 && /\s/.test(src[i - 1])) i--
  if (src.slice(Math.max(0, i - 2), i) !== '*/') return null
  const start = src.lastIndexOf('/**', i)
  if (start === -1) return null
  const end = src.indexOf('*/', start)
  if (end === -1) return null
  if (end + 2 !== i) return null
  return src.slice(start, end + 2)
}

function cleanJsDocForMarkdown(jsDoc) {
  if (!jsDoc) return null
  // Strip /**, */, and leading * spacing.
  const lines = jsDoc
    .split('\n')
    .map((l) => l.replace(/^\s*\/\*\*\s?/, '').replace(/\*\/\s*$/, '').replace(/^\s*\*\s?/, ''))
  const out = lines.join('\n').trim()
  return out.length ? out : null
}

function scanBalanced(src, startIdx, openChar, closeChar) {
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
  let i = afterNameIdx
  while (i < src.length && src[i] !== '=') i++
  if (i >= src.length) return null
  i++
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
    else if (ch === ';' && brace === 0 && paren === 0 && bracket === 0 && angle === 0) return i + 1
  }
  return null
}

function findLeadingJsDocBlock(src, exportStartIdx) {
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

function extractExportedTypeSymbols(src) {
  // export interface X { ... }, export type X = ...;, export enum X { ... }
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
    if (isInterface || isEnum) end = scanBalanced(src, afterNameIdx, '{', '}')
    else if (isType) end = scanTypeAliasEnd(src, afterNameIdx)
    if (!end) continue

    const jsDoc = findLeadingJsDocBlock(src, exportStart)
    const start = jsDoc?.start ?? exportStart
    const snippet = src.slice(start, end).trim()
    if (!snippet) continue
    symbols.push({ name, snippet, exportStart })
  }
  symbols.sort((a, b) => a.exportStart - b.exportStart)
  return symbols
}

function mdForTsFile({ title, relFromRepoRoot, description, exportedTypes }) {
  const lines = [`# ${title}`, '']

  if (description) {
    lines.push(description, '')
  }
  if (exportedTypes && exportedTypes.length > 0) {
    lines.push('## Exported types', '')
    for (const sym of exportedTypes) {
      lines.push(`### ${sym.name}`, '', '```ts', sym.snippet, '```', '')
    }
  }
  return lines.join('\n')
}

async function generateSection(sectionName, srcSubdir) {
  const srcDir = resolve(srcRoot, srcSubdir)
  if (!existsSync(srcDir)) return

  const outDir = resolve(outBase, sectionName)
  await cleanDir(outDir)

  const files = (await listTsFiles(srcDir)).sort((a, b) => a.localeCompare(b))
  for (const abs of files) {
    const relFromSrcSubdir = abs.slice(srcDir.length + 1).replaceAll('\\', '/')
    const outPath = resolve(outDir, relFromSrcSubdir.replace(/\.ts$/, '.md'))
    await mkdir(resolve(outPath, '..'), { recursive: true })

    const src = await readFile(abs, 'utf-8')

    const relFromRepoRoot = posix.join(
      'packages/primitive-app/src',
      toPosixPath(srcSubdir),
      relFromSrcSubdir
    )

    const fileBaseName = relFromSrcSubdir.split('/').pop()?.replace(/\.ts$/, '') ?? relFromSrcSubdir
    const jsDoc = extractLeadingJsDocForExportedFunction(src, fileBaseName)
    const description = cleanJsDocForMarkdown(jsDoc)
    const exportedTypes = extractExportedTypeSymbols(src)

    await writeFile(
      outPath,
      mdForTsFile({
        title: fileBaseName,
        relFromRepoRoot,
        description,
        exportedTypes,
      }),
      'utf-8'
    )
  }
}

await generateSection('composables', 'composables')
await generateSection('types', 'types')


