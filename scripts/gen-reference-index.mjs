import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, posix } from 'node:path'

const referenceRoot = resolve('docs/reference')
const generatedDir = resolve('docs/.vitepress/generated')
const navJsonPath = resolve('docs/.vitepress/generated/reference-nav.json')
const referenceIndexPath = resolve('docs/reference/index.md')

async function listDirSafe(p) {
  try {
    return await readdir(p, { withFileTypes: true })
  } catch {
    return []
  }
}

function toTitle(s) {
  return s
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function toVitePressLink(filePathFromDocs) {
  // input: "reference/js-bao/api/README.md" or "reference/primitive-app/components/Button.md"
  // output: "/reference/js-bao/api/README" (no extension)
  return '/' + filePathFromDocs.replace(/\.md$/i, '')
}

async function buildNav() {
  const items = []
  const top = await listDirSafe(referenceRoot)

  async function buildTree(absDir, relFromReferenceRoot) {
    const entries = await listDirSafe(absDir)

    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort((a, b) => a.localeCompare(b))
    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b))

    const out = []

    for (const d of dirs) {
      const childAbs = resolve(absDir, d)
      const childRel = posix.join(relFromReferenceRoot, d)
      const childItems = await buildTree(childAbs, childRel)
      if (childItems.length) out.push({ text: toTitle(d), items: childItems })
    }

    for (const f of files) {
      const relFromDocs = posix.join('reference', relFromReferenceRoot, f)
      out.push({ text: f.replace(/\.md$/i, ''), link: toVitePressLink(relFromDocs) })
    }

    return out
  }

  for (const ent of top) {
    if (!ent.isDirectory()) continue
    const project = ent.name
    if (project === '.vitepress') continue

    const projectDir = resolve(referenceRoot, project)
    const projectItems = []

    const projectEntries = await listDirSafe(projectDir)

    // Top-level pages: e.g. reference/primitive-app/createPrimitiveApp.md
    const topLevelFiles = projectEntries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b))

    if (topLevelFiles.length > 0) {
      const overviewItems = topLevelFiles.map((f) => {
        const relFromDocs = posix.join('reference', project, f)
        return { text: f.replace(/\.md$/i, ''), link: toVitePressLink(relFromDocs) }
      })
      projectItems.push({ text: 'Overview', items: overviewItems })
    }

    // One level deep grouping: e.g. api/, components/
    const sections = projectEntries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b))

    for (const secName of sections) {
      // For now, we hide primitive-app "types" from the nav entirely. Component-tied types
      // should be documented on the component pages instead.
      if (project === 'primitive-app' && secName === 'types') continue
      const secDir = resolve(projectDir, secName)
      const relFromReferenceRoot = posix.join(project, secName)
      const tree = await buildTree(secDir, relFromReferenceRoot)
      if (tree.length > 0) projectItems.push({ text: toTitle(secName), items: tree })
    }

    if (projectItems.length > 0) {
      items.push({ text: project, items: projectItems })
    }
  }

  items.sort((a, b) => a.text.localeCompare(b.text))
  return { items }
}

async function buildReferenceIndex(nav) {
  const lines = ['# Reference', '', 'Generated reference documentation for each project.', '']
  if (!nav.items.length) {
    lines.push('No reference docs have been generated yet. Run `pnpm gen:reference`.')
    lines.push('')
    return lines.join('\n')
  }

  function renderItems(items, depth) {
    const indent = '  '.repeat(depth)
    for (const it of items ?? []) {
      if (it.link) {
        lines.push(`${indent}- [${it.text}](${it.link})`)
      } else {
        lines.push(`${indent}- **${it.text}**`)
      }
      if (it.items?.length) renderItems(it.items, depth + 1)
    }
  }

  for (const project of nav.items) {
    lines.push(`## ${project.text}`)
    lines.push('')
    for (const section of project.items ?? []) {
      lines.push(`### ${section.text}`)
      lines.push('')
      renderItems(section.items ?? [], 0)
      lines.push('')
    }
  }
  return lines.join('\n')
}

const nav = await buildNav()
await mkdir(generatedDir, { recursive: true })
await writeFile(navJsonPath, JSON.stringify(nav, null, 2) + '\n', 'utf-8')

const indexMd = await buildReferenceIndex(nav)

// Avoid rewriting if unchanged (keeps git diffs clean)
let existing = ''
try {
  existing = await readFile(referenceIndexPath, 'utf-8')
} catch {
  // ignore
}
if (existing !== indexMd) {
  await writeFile(referenceIndexPath, indexMd, 'utf-8')
}


