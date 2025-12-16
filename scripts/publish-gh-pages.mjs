import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  if (res.status !== 0) process.exit(res.status ?? 1)
}

function ensureGitRepo() {
  const res = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' })
  if (res.status !== 0) {
    console.error('Not a git repository.')
    process.exit(1)
  }
}

ensureGitRepo()

if (!existsSync('docs/.vitepress/dist')) {
  console.log('[publish] Building site...')
  run('pnpm', ['docs:build'])
}

// Publish docs/.vitepress/dist to gh-pages using a temporary worktree.
// This keeps the built output committed (published form) without polluting main.
const worktreeDir = '.gh-pages-worktree'

console.log('[publish] Preparing gh-pages worktree...')
run('git', ['worktree', 'remove', '--force', worktreeDir], { stdio: 'ignore' })

// Create gh-pages branch if needed
const hasGhPages =
  spawnSync('git', ['show-ref', '--verify', '--quiet', 'refs/heads/gh-pages'], { stdio: 'ignore' }).status === 0
if (!hasGhPages) {
  run('git', ['branch', 'gh-pages'])
}

run('git', ['worktree', 'add', '-B', 'gh-pages', worktreeDir, 'gh-pages'])

console.log('[publish] Copying dist → gh-pages...')
// Use rsync if available; otherwise fall back to cp.
const hasRsync = spawnSync('rsync', ['--version'], { stdio: 'ignore' }).status === 0
if (hasRsync) {
  run('rsync', ['-av', '--delete', 'docs/.vitepress/dist/', `${worktreeDir}/`])
} else {
  run('rm', ['-rf', `${worktreeDir}/*`])
  run('cp', ['-R', 'docs/.vitepress/dist/.', worktreeDir])
}

console.log('[publish] Committing...')
run('git', ['-C', worktreeDir, 'add', '--all'])
run('git', ['-C', worktreeDir, 'commit', '-m', 'docs: publish', '--allow-empty'])

console.log('[publish] Pushing gh-pages...')
run('git', ['-C', worktreeDir, 'push', 'origin', 'gh-pages'])

console.log('[publish] Cleanup...')
run('git', ['worktree', 'remove', '--force', worktreeDir])


