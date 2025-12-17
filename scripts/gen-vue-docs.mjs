import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { PROJECTS } from './config.mjs'
import { cleanDir, ensureDepsInstalled, run } from './utils.mjs'
import { rm } from 'node:fs/promises'

function ensureRootToolingInstalled() {
  const bin =
    process.platform === 'win32'
      ? resolve('node_modules/.bin/vue-docgen.cmd')
      : resolve('node_modules/.bin/vue-docgen')
  if (!existsSync(bin)) {
    console.error(
      [
        '[gen:vue-docs] Missing vue-docgen-cli binary in this repo.',
        'Run `pnpm install` at the repo root, then retry.',
      ].join(' ')
    )
    process.exit(1)
  }
}

const vueProjects = PROJECTS.filter((p) => p.type === 'vue-docgen')

ensureRootToolingInstalled()

for (const p of vueProjects) {
  const repoPath = resolve(p.repoPath)
  if (!existsSync(repoPath)) {
    console.warn(`[gen:vue-docs] Missing ${p.id} at ${p.repoPath}; skipping.`)
    continue
  }

  await ensureDepsInstalled(repoPath)
  await cleanDir(resolve(p.outDir))

  // vue-docgen-cli will parse Vue SFCs and generate Markdown pages describing
  // props/events/slots. We use a dedicated config file to keep CLI arguments stable.
  const configFile = resolve('scripts/vue-docgen.config.cjs')

  console.log(`[gen:vue-docs] ${p.id} → ${p.outDir}`)
  try {
    run('pnpm', ['exec', 'vue-docgen', '-c', configFile], { cwd: process.cwd() })
  } catch (e) {
    console.warn(
      [
        `[gen:vue-docs] Failed to run vue-docgen-cli for ${p.id}.`,
        `This is often due to version/config differences in vue-docgen-cli.`,
        `You can run \`pnpm exec vue-docgen --help\` to see supported flags, then adjust scripts/vue-docgen.config.cjs.`,
      ].join(' ')
    )
    throw e
  }

  // Suppress docs for primitive-app/src/components/ui/**
  // (we still allow other components/layouts/pages)
  if (p.id === 'primitive-app') {
    const uiDocsDir = resolve(p.outDir, 'components', 'ui')
    await rm(uiDocsDir, { recursive: true, force: true })

    const debugSuiteDocsDir = resolve(p.outDir, 'components', 'debug-suite')
    await rm(debugSuiteDocsDir, { recursive: true, force: true })
  }
}


