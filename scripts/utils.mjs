import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

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

export function detectPackageManager(repoPath) {
  const pnpmLock = resolve(repoPath, 'pnpm-lock.yaml')
  const npmLock = resolve(repoPath, 'package-lock.json')
  if (existsSync(pnpmLock)) return 'pnpm'
  if (existsSync(npmLock)) return 'npm'
  return 'unknown'
}

export async function ensureDepsInstalled(repoPath) {
  const nm = resolve(repoPath, 'node_modules')
  if (await pathExists(nm)) return

  const pm = detectPackageManager(repoPath)
  if (pm === 'pnpm') {
    run('pnpm', ['install'], { cwd: repoPath })
  } else if (pm === 'npm') {
    // Prefer reproducible installs when possible.
    const hasLock = existsSync(resolve(repoPath, 'package-lock.json'))
    run('npm', [hasLock ? 'ci' : 'install'], { cwd: repoPath })
  } else {
    // Best-effort fallback.
    run('npm', ['install'], { cwd: repoPath })
  }
}


