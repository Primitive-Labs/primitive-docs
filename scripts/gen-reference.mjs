import { spawnSync } from 'node:child_process'

function run(nodeScript) {
  const res = spawnSync(process.execPath, [nodeScript], { stdio: 'inherit' })
  if (res.status !== 0) process.exit(res.status ?? 1)
}

run('scripts/gen-typedoc.mjs')
run('scripts/gen-vue-docs.mjs')
run('scripts/gen-reference-index.mjs')


