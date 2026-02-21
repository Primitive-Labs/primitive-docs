import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  if (res.status !== 0) process.exit(res.status ?? 1)
}

function tryRun(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  return res.status ?? 1
}

function ensureGitRepo() {
  const res = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' })
  if (res.status !== 0) {
    console.error('Not a git repository.')
    process.exit(1)
  }
}

function ensureOriginRemote() {
  const res = spawnSync('git', ['remote', 'get-url', 'origin'], { stdio: 'ignore' })
  if (res.status !== 0) {
    console.error('Missing git remote "origin". Add it, or edit this script to push to a different remote.')
    process.exit(1)
  }
}

function emptyDirPreserveGit(dir) {
  // In a git worktree, `.git` is a special file (gitfile) used by git to manage the worktree.
  // If we delete it, `git worktree remove` fails. So always preserve it.
  for (const name of readdirSync(dir)) {
    if (name === '.git') continue
    rmSync(join(dir, name), { recursive: true, force: true })
  }
}

ensureGitRepo()
ensureOriginRemote()

if (!existsSync('docs/.vitepress/dist')) {
  console.log('[publish] Building site...')
  run('pnpm', ['docs:build'])
}

// Publish docs/.vitepress/dist to gh-pages using a temporary worktree.
// This keeps the built output committed (published form) without polluting main.
const worktreeDir = '.gh-pages-worktree'

console.log('[publish] Preparing gh-pages worktree...')
// If the worktree doesn't exist yet, git exits non-zero (often 128). That's fine.
tryRun('git', ['worktree', 'remove', '--force', worktreeDir], { stdio: 'ignore' })

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
  // Preserve the worktree's `.git` file while deleting everything else.
  run('rsync', ['-av', '--delete', '--exclude', '.git', 'docs/.vitepress/dist/', `${worktreeDir}/`])
} else {
  emptyDirPreserveGit(worktreeDir)
  run('cp', ['-R', 'docs/.vitepress/dist/.', worktreeDir])
}

console.log('[publish] Committing...')
run('git', ['-C', worktreeDir, 'add', '--all'])
run('git', ['-C', worktreeDir, 'commit', '-m', 'docs: publish', '--allow-empty'])

console.log('[publish] Pushing gh-pages...')
run('git', ['-C', worktreeDir, 'push', '--force', 'origin', 'gh-pages'])

console.log('[publish] Cleanup...')
if (tryRun('git', ['worktree', 'remove', '--force', worktreeDir], { stdio: 'ignore' }) !== 0) {
  // If something went wrong (e.g. previous buggy run deleted `.git`), fall back to deleting the dir.
  try {
    rmSync(worktreeDir, { recursive: true, force: true })
  } catch {
    // ignore
  }
}


