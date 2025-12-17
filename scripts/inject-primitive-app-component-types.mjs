import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, posix } from 'node:path'

const repoRoot = process.cwd()
const primitiveSrcRoot = resolve(repoRoot, 'packages/primitive-app/src')
const vueDocsRoot = resolve(repoRoot, 'docs/reference/primitive-app/components')

const START_MARKER = '<!-- component-types:start -->'
const END_MARKER = '<!-- component-types:end -->'

if (!existsSync(primitiveSrcRoot)) {
  console.warn('[inject:primitive-app-component-types] Missing packages/primitive-app/src; skipping.')
  process.exit(0)
}
if (!existsSync(vueDocsRoot)) {
  console.warn('[inject:primitive-app-component-types] Missing primitive-app vue docs; skipping.')
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

async function listVueFiles(dirAbs) {
  const entries = await readdir(dirAbs, { withFileTypes: true })
  const out = []
  for (const e of entries) {
    const p = resolve(dirAbs, e.name)
    if (e.isDirectory()) out.push(...(await listVueFiles(p)))
    else if (e.isFile() && e.name.endsWith('.vue')) out.push(p)
  }
  return out
}

function toPosixPath(p) {
  return p.replaceAll('\\', '/')
}

function stripJsDoc(jsDoc) {
  if (!jsDoc) return null
  const lines = jsDoc
    .split('\n')
    .map((l) => l.replace(/^\s*\/\*\*\s?/, '').replace(/\*\/\s*$/, '').replace(/^\s*\*\s?/, ''))
  const content = lines.join('\n')

  // Drop @tags lines, keep plain prose.
  const cleaned = content
    .split('\n')
    .filter((l) => !l.trim().startsWith('@'))
    .join('\n')
    .trim()

  return cleaned.length ? cleaned : null
}

function findLeadingJsDocBlock(src, startIdx) {
  let i = startIdx
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
    else if (ch === ';' && brace === 0 && paren === 0 && bracket === 0 && angle === 0) return i + 1
  }
  return null
}

function extractTypeDecls(src) {
  // interface X { ... }, enum X { ... }, type X = ...;
  const re =
    /\b(?:export\s+)?(?:declare\s+)?(?:(?:const\s+)?enum|interface|type)\s+([A-Za-z_$][\w$]*)/g
  const decls = []

  for (let m; (m = re.exec(src)); ) {
    const name = m[1]
    const declStart = m.index
    const kindChunk = src.slice(m.index, m.index + 60)
    const isInterface = /\binterface\b/.test(kindChunk)
    const isEnum = /\benum\b/.test(kindChunk)
    const isType = /\btype\b/.test(kindChunk)

    let end = null
    const afterNameIdx = re.lastIndex
    if (isInterface || isEnum) end = scanBalanced(src, afterNameIdx, '{', '}')
    else if (isType) end = scanTypeAliasEnd(src, afterNameIdx)
    if (!end) continue

    const jsDoc = findLeadingJsDocBlock(src, declStart)
    const start = jsDoc?.start ?? declStart
    const snippet = src.slice(start, end).trim()
    if (!snippet) continue

    decls.push({ name, snippet, declStart, kind: isInterface ? 'interface' : isEnum ? 'enum' : 'type' })
  }

  decls.sort((a, b) => a.declStart - b.declStart)
  return decls
}

function hasComponentTypeTag(snippet) {
  const m = /\/\*\*[\s\S]*?\*\//.exec(snippet)
  if (!m) return false
  return /@componentType\b/i.test(m[0])
}

function extractDocFromSnippet(snippet) {
  const m = /\/\*\*[\s\S]*?\*\//.exec(snippet)
  if (!m) return null
  return stripJsDoc(m[0])
}

function splitTopLevelMembers(body) {
  const members = []
  let i = 0
  let start = 0
  let brace = 0
  let paren = 0
  let bracket = 0
  let angle = 0
  let inSingleQuote = false
  let inDoubleQuote = false
  let inTemplate = false

  function pushMember(endIdx) {
    const s = body.slice(start, endIdx).trim()
    if (s) members.push(s)
    start = endIdx + 1
  }

  for (; i < body.length; i++) {
    const ch = body[i]

    // Very small string handling so we don't explode on literal types.
    if (!inDoubleQuote && !inTemplate && ch === "'" && body[i - 1] !== '\\') inSingleQuote = !inSingleQuote
    else if (!inSingleQuote && !inTemplate && ch === '"' && body[i - 1] !== '\\')
      inDoubleQuote = !inDoubleQuote
    else if (!inSingleQuote && !inDoubleQuote && ch === '`' && body[i - 1] !== '\\') inTemplate = !inTemplate
    if (inSingleQuote || inDoubleQuote || inTemplate) continue

    if (ch === '{') brace++
    else if (ch === '}') brace = Math.max(0, brace - 1)
    else if (ch === '(') paren++
    else if (ch === ')') paren = Math.max(0, paren - 1)
    else if (ch === '[') bracket++
    else if (ch === ']') bracket = Math.max(0, bracket - 1)
    else if (ch === '<') angle++
    else if (ch === '>') angle = Math.max(0, angle - 1)
    else if (ch === ';' && brace === 0 && paren === 0 && bracket === 0 && angle === 0) {
      pushMember(i)
    }
  }
  // Remainder
  const tail = body.slice(start).trim()
  if (tail) members.push(tail)
  return members
}

function parseInterfaceProps(snippet) {
  // Returns [{name, optional, type, description}]
  const ifaceMatch = /\binterface\s+[A-Za-z_$][\w$]*\b/.exec(snippet)
  if (!ifaceMatch) return []
  const openIdx = snippet.indexOf('{', ifaceMatch.index)
  if (openIdx === -1) return []
  const closeIdx = scanBalanced(snippet, openIdx, '{', '}')
  if (!closeIdx) return []

  const body = snippet.slice(openIdx + 1, closeIdx - 1)
  const members = splitTopLevelMembers(body)

  const props = []
  let pendingJsDoc = null

  for (const raw of members) {
    const s = raw.trim()
    if (!s) continue

    // Capture and strip a leading JSDoc.
    const jsDocMatch = s.match(/^\/\*\*[\s\S]*?\*\/\s*/)
    if (jsDocMatch) {
      pendingJsDoc = jsDocMatch[0]
      const rest = s.slice(jsDocMatch[0].length).trim()
      if (!rest) continue
      // continue processing rest as a member with pendingJsDoc
      const m = rest.match(/^([A-Za-z_$][\w$]*)(\?)?\s*:\s*([\s\S]+)$/)
      if (!m) {
        pendingJsDoc = null
        continue
      }
      const [, name, opt, type] = m
      props.push({
        name,
        optional: Boolean(opt),
        type: type.trim().replace(/\s+/g, ' '),
        description: stripJsDoc(pendingJsDoc),
      })
      pendingJsDoc = null
      continue
    }

    // Ignore method signatures: foo(): void
    if (/^[A-Za-z_$][\w$]*\s*\(/.test(s)) {
      pendingJsDoc = null
      continue
    }

    const m = s.match(/^([A-Za-z_$][\w$]*)(\?)?\s*:\s*([\s\S]+)$/)
    if (!m) {
      pendingJsDoc = null
      continue
    }
    const [, name, opt, type] = m
    props.push({
      name,
      optional: Boolean(opt),
      type: type.trim().replace(/\s+/g, ' '),
      description: pendingJsDoc ? stripJsDoc(pendingJsDoc) : null,
    })
    pendingJsDoc = null
  }

  return props
}

function renderTypesMarkdown(decls) {
  const lines = [START_MARKER, '## Types', '']
  for (const d of decls) {
    lines.push(`### ${d.name}`, '')
    const desc = extractDocFromSnippet(d.snippet)
    if (desc) lines.push(desc, '')

    if (d.kind === 'interface') {
      const props = parseInterfaceProps(d.snippet)
      if (props.length) {
        lines.push('| Property | Type | Description |', '| --- | --- | --- |')
        for (const p of props) {
          const propName = p.optional ? `${p.name}?` : p.name
          const type = p.type.replace(/\|/g, '\\|') // keep table sane
          const descCell = (p.description ?? '').replace(/\n+/g, '<br/>').replace(/\|/g, '\\|')
          lines.push(`| \`${propName}\` | \`${type}\` | ${descCell} |`)
        }
        lines.push('')
      }
    }

    lines.push('```ts', d.snippet, '```', '')
  }
  lines.push(END_MARKER, '')
  return lines.join('\n')
}

function extractTsFromVueSfc(vueSource) {
  // Pull TS from any <script ... lang="ts" ...> blocks.
  const blocks = []
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
  for (let m; (m = re.exec(vueSource)); ) {
    const attrs = m[1] ?? ''
    const content = m[2] ?? ''
    if (!/\blang\s*=\s*["']ts["']/.test(attrs)) continue
    blocks.push(content)
  }
  return blocks.join('\n\n')
}

function replaceOrAppendBlock(md, block) {
  const startIdx = md.indexOf(START_MARKER)
  const endIdx = md.indexOf(END_MARKER)

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return md.slice(0, startIdx) + block + md.slice(endIdx + END_MARKER.length)
  }

  // Prefer inserting before a trailing horizontal rule used by vue-docgen.
  const trailer = '\n---\n'
  if (md.endsWith(trailer)) {
    return md.slice(0, -trailer.length) + '\n' + block + trailer
  }

  return md.trimEnd() + '\n\n' + block
}

const vueFiles = await listVueFiles(primitiveSrcRoot)
const vueByRel = new Map(vueFiles.map((abs) => [toPosixPath(abs.slice(primitiveSrcRoot.length + 1)), abs]))
const vueByBase = new Map()
for (const abs of vueFiles) {
  const base = posix.basename(toPosixPath(abs))
  const arr = vueByBase.get(base) ?? []
  arr.push(abs)
  vueByBase.set(base, arr)
}

function resolveSourceForDoc(mdAbs) {
  const rel = toPosixPath(mdAbs.slice(vueDocsRoot.length + 1))
  const relNoExt = rel.replace(/\.md$/, '')
  const candidateRel = `${relNoExt}.vue`

  const direct = vueByRel.get(candidateRel)
  if (direct) return direct

  // Fallback: match by basename if the directory structure differs.
  const base = posix.basename(candidateRel)
  const candidates = vueByBase.get(base) ?? []
  if (candidates.length === 1) return candidates[0]

  // Prefer a candidate that contains the same leading folder (components/layouts/pages) if possible.
  const lead = rel.split('/')[0]
  const preferred = candidates.find((p) => toPosixPath(p).includes(`/src/${lead}/`))
  return preferred ?? candidates[0] ?? null
}

const mdFiles = await listMdFiles(vueDocsRoot)
let updatedCount = 0

for (const mdAbs of mdFiles) {
  const vueAbs = resolveSourceForDoc(mdAbs)
  if (!vueAbs) continue

  const vueSrc = await readFile(vueAbs, 'utf-8')
  const ts = extractTsFromVueSfc(vueSrc)
  if (!ts.trim()) continue

  const decls = extractTypeDecls(ts).filter((d) => hasComponentTypeTag(d.snippet))
  if (!decls.length) continue

  const before = await readFile(mdAbs, 'utf-8')
  const block = renderTypesMarkdown(decls)
  const after = replaceOrAppendBlock(before, block)
  if (after !== before) {
    await writeFile(mdAbs, after, 'utf-8')
    updatedCount++
  }
}

console.log(`[inject:primitive-app-component-types] Updated ${updatedCount} component page(s).`)


