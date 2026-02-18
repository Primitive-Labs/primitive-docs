import { spawnSync } from 'node:child_process'
import { existsSync, realpathSync, lstatSync } from 'node:fs'
import { mkdir, rm, stat } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'

export function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  if (res.status !== 0) {
    const pretty = [cmd, ...args].join(' ')
    throw new Error(`Command failed (${res.status}): ${pretty}`)
  }
}

export async function ensureDir(p) {
  await mkdir(p, { recursive: true })
}

export async function cleanDir(p) {
  await rm(p, { recursive: true, force: true })
  await ensureDir(p)
}

export async function pathExists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

/**
 * Find the repo root by walking up from a path looking for lock files.
 * Resolves symlinks first to handle packages/* symlinks pointing to subdirectories.
 */
export function findRepoRoot(startPath) {
  // Resolve symlinks to get the real path
  let currentPath
  try {
    currentPath = realpathSync(startPath)
  } catch {
    currentPath = startPath
  }

  // Walk up looking for lock files or .git
  while (currentPath !== dirname(currentPath)) {
    if (
      existsSync(resolve(currentPath, 'pnpm-lock.yaml')) ||
      existsSync(resolve(currentPath, 'package-lock.json')) ||
      existsSync(resolve(currentPath, '.git'))
    ) {
      return currentPath
    }
    currentPath = dirname(currentPath)
  }

  // Fallback to the original path
  return startPath
}

export function detectPackageManager(repoPath) {
  const pnpmLock = resolve(repoPath, 'pnpm-lock.yaml')
  const npmLock = resolve(repoPath, 'package-lock.json')
  if (existsSync(pnpmLock)) return 'pnpm'
  if (existsSync(npmLock)) return 'npm'
  // Default to pnpm since this is a pnpm workspace project
  return 'pnpm'
}

export async function ensureDepsInstalled(repoPath) {
  // Find the actual repo root (handles symlinks to subdirectories)
  const actualRepoRoot = findRepoRoot(repoPath)

  const nm = resolve(actualRepoRoot, 'node_modules')
  if (await pathExists(nm)) return

  const pm = detectPackageManager(actualRepoRoot)
  if (pm === 'pnpm') {
    run('pnpm', ['install'], { cwd: actualRepoRoot })
  } else if (pm === 'npm') {
    // Prefer reproducible installs when possible.
    const hasLock = existsSync(resolve(actualRepoRoot, 'package-lock.json'))
    run('npm', [hasLock ? 'ci' : 'install'], { cwd: actualRepoRoot })
  } else {
    // Best-effort fallback - use pnpm since this is a pnpm workspace project
    run('pnpm', ['install'], { cwd: actualRepoRoot })
  }
}


