import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const cmd = process.argv[2]

function runGit(args) {
  const res = spawnSync('git', args, { stdio: 'inherit' })
  if (res.status !== 0) process.exit(res.status ?? 1)
}

function ensureGitRepo() {
  const res = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' })
  if (res.status !== 0) {
    console.error('Not a git repository. Submodule commands require git.')
    process.exit(1)
  }
}

function ensureGitmodulesIfNeeded() {
  if (!existsSync('.gitmodules')) {
    console.warn('No .gitmodules found. Skipping submodule step.')
    process.exit(0)
  }
}

ensureGitRepo()

if (cmd === 'init') {
  ensureGitmodulesIfNeeded()
  runGit(['submodule', 'update', '--init', '--recursive'])
} else if (cmd === 'update') {
  ensureGitmodulesIfNeeded()
  // Updates tracked branches for submodules (e.g. main) and merges into the checked-out commits.
  runGit(['submodule', 'update', '--remote', '--merge', '--recursive'])
} else {
  console.error('Usage: node scripts/submodules.mjs <init|update>')
  process.exit(1)
}


