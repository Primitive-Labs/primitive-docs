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

/**
 * Parse JSDoc content into structured parts: description and tags.
 * Returns { description: string, params: [{name, type, description}], returns: string, throws: string }
 */
function parseJsDocContent(jsDoc) {
  if (!jsDoc) return null

  // Strip /**, */, and leading * spacing
  const lines = jsDoc
    .split('\n')
    .map((l) => l.replace(/^\s*\/\*\*\s?/, '').replace(/\*\/\s*$/, '').replace(/^\s*\*\s?/, ''))

  const result = {
    description: [],
    params: [],
    returns: null,
    throws: null
  }

  let currentTag = null
  let currentTagContent = []

  const flushTag = () => {
    if (!currentTag) return
    const content = currentTagContent.join(' ').trim()
    
    if (currentTag === 'param') {
      // Parse @param {type} name - description OR @param name - description
      const paramMatch = content.match(/^(?:\{([^}]+)\}\s+)?(\S+)\s*-?\s*(.*)$/)
      if (paramMatch) {
        result.params.push({
          name: paramMatch[2],
          type: paramMatch[1] || null,
          description: paramMatch[3] || ''
        })
      }
    } else if (currentTag === 'returns' || currentTag === 'return') {
      result.returns = content.replace(/^\{[^}]+\}\s*/, '') // Strip type if present
    } else if (currentTag === 'throws' || currentTag === 'throw') {
      result.throws = content.replace(/^\{[^}]+\}\s*/, '') // Strip type if present
    }
    
    currentTag = null
    currentTagContent = []
  }

  for (const line of lines) {
    const tagMatch = line.match(/^@(\w+)\s*(.*)$/)
    
    if (tagMatch) {
      flushTag()
      currentTag = tagMatch[1]
      currentTagContent = [tagMatch[2]]
    } else if (currentTag) {
      // Continuation of current tag
      currentTagContent.push(line)
    } else {
      // Part of description
      result.description.push(line)
    }
  }
  
  flushTag()
  
  result.description = result.description.join('\n').trim()
  
  return result
}

/**
 * Format parsed JSDoc content into markdown with a parameters table.
 */
function formatJsDocAsMarkdown(parsed) {
  if (!parsed) return null
  
  const lines = []
  
  // Add description
  if (parsed.description) {
    lines.push(parsed.description, '')
  }
  
  // Add parameters table if there are any
  if (parsed.params.length > 0) {
    lines.push('| Parameter | Description |')
    lines.push('| --- | --- |')
    for (const param of parsed.params) {
      const name = `\`${param.name}\``
      const desc = param.description || '*No description*'
      lines.push(`| ${name} | ${desc} |`)
    }
    lines.push('')
  }
  
  // Add returns
  if (parsed.returns) {
    lines.push(`**Returns:** ${parsed.returns}`, '')
  }
  
  // Add throws
  if (parsed.throws) {
    lines.push(`**Throws:** ${parsed.throws}`, '')
  }
  
  const result = lines.join('\n').trim()
  return result.length ? result : null
}

/**
 * Extract module-level JSDoc comment (one that starts with @module).
 * This is typically at the top of the file before any imports.
 */
function extractModuleLevelJsDoc(src) {
  // Look for a JSDoc comment at the start of the file (possibly after shebang or whitespace)
  const match = src.match(/^\s*(\/\*\*[\s\S]*?\*\/)/m)
  if (!match) return null
  
  const jsDoc = match[1]
  // Check if this is a module-level doc (contains @module)
  if (!jsDoc.includes('@module')) return null
  
  return jsDoc
}

function cleanModuleJsDocForMarkdown(jsDoc) {
  if (!jsDoc) return null
  
  // Strip /**, */, and leading * spacing
  let lines = jsDoc
    .split('\n')
    .map((l) => l.replace(/^\s*\/\*\*\s?/, '').replace(/\*\/\s*$/, '').replace(/^\s*\*\s?/, ''))
  
  // Remove the @module line itself since we use the filename as title
  lines = lines.filter((l) => !l.trim().startsWith('@module'))
  
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

/**
 * Extract the return statement body from a Pinia defineStore setup function.
 * Returns the content between the final `return {` and closing `}`.
 */
function extractStoreReturnBody(src) {
  // Find defineStore call
  const defineStoreMatch = src.match(/defineStore\s*\(\s*["'][^"']+["']\s*,\s*\(\s*\)\s*=>\s*\{/)
  if (!defineStoreMatch) return null

  const storeBodyStart = defineStoreMatch.index + defineStoreMatch[0].length

  // Find all return statements and get the last one (the store's public API)
  const returnRegex = /\breturn\s*\{/g
  let lastReturnMatch = null
  let match
  while ((match = returnRegex.exec(src)) !== null) {
    if (match.index >= storeBodyStart) {
      lastReturnMatch = match
    }
  }

  if (!lastReturnMatch) return null

  const returnStart = lastReturnMatch.index + lastReturnMatch[0].length
  const returnEnd = scanBalanced(src, returnStart - 1, '{', '}')
  if (!returnEnd) return null

  return {
    body: src.slice(returnStart, returnEnd - 1),
    startIdx: lastReturnMatch.index,
    fullSrc: src
  }
}

/**
 * Parse store members from the return statement body.
 * Detects categories from comments like `// state`, `// getters`, `// actions`.
 */
function parseStoreMembers(returnInfo) {
  if (!returnInfo) return null

  const { body, startIdx, fullSrc } = returnInfo
  const members = { state: [], getters: [], actions: [] }
  let currentCategory = 'actions' // Default category

  // Split into lines and process
  const lines = body.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Check for category comments
    if (/^\/\/\s*state\b/i.test(line)) {
      currentCategory = 'state'
      continue
    }
    if (/^\/\/\s*(getters?|computed|derived)\b/i.test(line)) {
      currentCategory = 'getters'
      continue
    }
    if (/^\/\/\s*(actions?|methods?|functions?)\b/i.test(line)) {
      currentCategory = 'actions'
      continue
    }
    if (/^\/\/\s*(config|configuration)\b/i.test(line)) {
      currentCategory = 'state'
      continue
    }
    if (/^\/\/\s*(lifecycle)\b/i.test(line)) {
      currentCategory = 'actions'
      continue
    }
    if (/^\/\/\s*(prefs|preferences)\b/i.test(line)) {
      currentCategory = 'actions'
      continue
    }

    // Skip empty lines and other comments
    if (!line || line.startsWith('//')) continue

    // Parse member: could be `name,` or `name: value,`
    const memberMatch = line.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:,]/)
    if (!memberMatch) continue

    const memberName = memberMatch[1]
    
    // Skip deprecated aliases
    if (line.includes('deprecated')) continue

    members[currentCategory].push({
      name: memberName,
      description: null // Will be populated from JSDoc if available
    })
  }

  // Now try to find JSDoc comments for each member in the full source
  for (const category of ['state', 'getters', 'actions']) {
    for (const member of members[category]) {
      const jsDoc = findJsDocForMember(fullSrc, member.name)
      if (jsDoc) {
        if (category === 'actions') {
          // For actions, use the table formatting for params
          const parsed = parseJsDocContent(jsDoc)
          member.description = formatJsDocAsMarkdown(parsed)
        } else {
          // For state and getters, just use the description
          const parsed = parseJsDocContent(jsDoc)
          member.description = parsed?.description || null
        }
      }
    }
  }

  return members
}

/**
 * Find JSDoc comment for a store member (function, const, or ref).
 */
function findJsDocForMember(src, memberName) {
  // Try to find the member definition with various patterns
  const patterns = [
    // const memberName = async <T>(...) => ... (generic async arrow)
    new RegExp(`(^|\\n)\\s*const\\s+${memberName}\\s*=\\s*async\\s*<[^>]+>\\s*\\(`, 'm'),
    // const memberName = async (...) => ...
    new RegExp(`(^|\\n)\\s*const\\s+${memberName}\\s*=\\s*async\\s*\\(`, 'm'),
    // const memberName = <T>(...) => ... (generic arrow)
    new RegExp(`(^|\\n)\\s*const\\s+${memberName}\\s*=\\s*<[^>]+>\\s*\\(`, 'm'),
    // const memberName = (...) => ...
    new RegExp(`(^|\\n)\\s*const\\s+${memberName}\\s*=\\s*\\(`, 'm'),
    // const memberName = ref( or ref<T>( (handles nested generics)
    new RegExp(`(^|\\n)\\s*const\\s+${memberName}\\s*=\\s*ref(?:<[^>]*(?:<[^>]*>[^>]*)*>)?\\(`, 'm'),
    // const memberName = computed( or computed<T>( (handles nested generics)
    new RegExp(`(^|\\n)\\s*const\\s+${memberName}\\s*=\\s*computed(?:<[^>]*(?:<[^>]*>[^>]*)*>)?\\(`, 'm'),
    // async function memberName(
    new RegExp(`(^|\\n)\\s*(?:async\\s+)?function\\s+${memberName}\\s*\\(`, 'm'),
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(src)
    if (match) {
      const defStart = match.index + (match[1]?.length || 0)
      const jsDocBlock = findLeadingJsDocBlock(src, defStart)
      if (jsDocBlock) {
        return src.slice(jsDocBlock.start, jsDocBlock.end)
      }
    }
  }

  return null
}

/**
 * Check if a file contains a Pinia store definition.
 */
function isStoreFile(src) {
  return /\bdefineStore\s*\(/.test(src)
}

function mdForTsFile({ title, relFromRepoRoot, description, moduleDescription, exportedTypes, storeMembers }) {
  const lines = [`# ${title}`, '']

  // Prefer module-level description over function-level
  const mainDescription = moduleDescription || description
  if (mainDescription) {
    lines.push(mainDescription, '')
  }

  // Add store members documentation if this is a store
  if (storeMembers) {
    // State section
    if (storeMembers.state.length > 0) {
      lines.push('## State', '')
      for (const member of storeMembers.state) {
        lines.push(`### \`${member.name}\``, '')
        if (member.description) {
          lines.push(member.description, '')
        }
      }
    }

    // Getters section
    if (storeMembers.getters.length > 0) {
      lines.push('## Getters', '')
      for (const member of storeMembers.getters) {
        lines.push(`### \`${member.name}\``, '')
        if (member.description) {
          lines.push(member.description, '')
        }
      }
    }

    // Actions section
    if (storeMembers.actions.length > 0) {
      lines.push('## Actions', '')
      for (const member of storeMembers.actions) {
        lines.push(`### \`${member.name}\``, '')
        if (member.description) {
          lines.push(member.description, '')
        }
      }
    }
  }

  if (exportedTypes && exportedTypes.length > 0) {
    lines.push('## Exported types', '')
    for (const sym of exportedTypes) {
      lines.push(`### ${sym.name}`, '', '```ts', sym.snippet, '```', '')
    }
  }
  return lines.join('\n')
}

// Files to exclude from documentation generation (internal/debug utilities)
const EXCLUDED_FILES = new Set([
  'documentDebuggerStore.ts',
])

async function generateSection(sectionName, srcSubdir) {
  const srcDir = resolve(srcRoot, srcSubdir)
  if (!existsSync(srcDir)) return

  const outDir = resolve(outBase, sectionName)
  await cleanDir(outDir)

  const files = (await listTsFiles(srcDir))
    .filter((f) => !EXCLUDED_FILES.has(f.split('/').pop()))
    .sort((a, b) => a.localeCompare(b))
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
    
    // Try to extract module-level JSDoc first
    const moduleJsDoc = extractModuleLevelJsDoc(src)
    const moduleDescription = cleanModuleJsDocForMarkdown(moduleJsDoc)
    
    // Fall back to function-level JSDoc if no module doc
    const jsDoc = extractLeadingJsDocForExportedFunction(src, fileBaseName)
    const description = cleanJsDocForMarkdown(jsDoc)
    const exportedTypes = extractExportedTypeSymbols(src)

    // Extract store members if this is a Pinia store
    let storeMembers = null
    if (isStoreFile(src)) {
      const returnInfo = extractStoreReturnBody(src)
      storeMembers = parseStoreMembers(returnInfo)
    }

    await writeFile(
      outPath,
      mdForTsFile({
        title: fileBaseName,
        relFromRepoRoot,
        description,
        moduleDescription,
        exportedTypes,
        storeMembers,
      }),
      'utf-8'
    )
  }
}

await generateSection('composables', 'composables')
await generateSection('types', 'types')
await generateSection('stores', 'stores')
await generateSection('services', 'services')
await generateSection('router', 'router')


