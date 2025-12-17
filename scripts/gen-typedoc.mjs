import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { PROJECTS } from './config.mjs'
import { cleanDir, ensureDepsInstalled, run } from './utils.mjs'

function ensureRootToolingInstalled() {
  const typedocBin =
    process.platform === 'win32' ? resolve('node_modules/.bin/typedoc.cmd') : resolve('node_modules/.bin/typedoc')
  if (!existsSync(typedocBin)) {
    console.error(
      [
        '[gen:typedoc] Missing TypeDoc binary in this repo.',
        'Run `pnpm install` at the repo root, then retry.',
      ].join(' ')
    )
    process.exit(1)
  }
}

const typedocProjects = PROJECTS.filter((p) => p.type === 'typedoc')

ensureRootToolingInstalled()

for (const p of typedocProjects) {
  const repoPath = resolve(p.repoPath)
  if (!existsSync(repoPath)) {
    console.warn(`[gen:typedoc] Missing ${p.id} at ${p.repoPath}; skipping.`)
    continue
  }

  const entryPoints = (p.entryPoints ?? []).map((ep) => resolve(ep)).filter((ep) => existsSync(ep))
  if (entryPoints.length === 0) {
    console.warn(`[gen:typedoc] No entry points found for ${p.id}; skipping.`)
    continue
  }

  await ensureDepsInstalled(repoPath)
  await cleanDir(resolve(p.outDir))

  // Use the project's own TS config so compilerOptions (target, downlevelIteration, paths, etc.)
  // match how the library actually builds.
  const tsconfigPath = existsSync(resolve(repoPath, 'tsconfig.json')) ? resolve(repoPath, 'tsconfig.json') : undefined

  // Generate Markdown suitable for VitePress routing.
  // Note: TypeDoc often needs the library deps installed to resolve types.
  const args = [
    'exec',
    'typedoc',
    '--plugin',
    'typedoc-plugin-markdown',
    '--plugin',
    resolve('scripts/typedoc-plugin-hide-underscore.mjs'),
    '--theme',
    'markdown',
    ...(tsconfigPath ? ['--tsconfig', tsconfigPath] : []),
    // Keep doc builds resilient; we don't want non-doc type errors to block documentation.
    '--skipErrorChecking',
    // Remove "Defined in: ..." (source locations / git links) from the generated Markdown.
    '--disableSources',
    '--out',
    resolve(p.outDir),
    ...entryPoints,
  ]

  console.log(`[gen:typedoc] ${p.id} → ${p.outDir}`)
  run('pnpm', args, { cwd: process.cwd() })
}


