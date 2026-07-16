import { spawn } from 'node:child_process'

import chokidar from 'chokidar'

let timeout
let running = false
let pending = false

function executeGenerator() {
  if (running) {
    pending = true
    return
  }

  running = true
  const child = spawn(process.execPath, ['scripts/generate-template-registry.mjs'], {
    stdio: 'inherit',
  })

  child.on('close', () => {
    running = false
    if (pending) {
      pending = false
      executeGenerator()
    }
  })
}

function scheduleGeneration() {
  clearTimeout(timeout)
  timeout = setTimeout(executeGenerator, 150)
}

chokidar
  .watch('src/templates', { ignoreInitial: true })
  .on('add', scheduleGeneration)
  .on('unlink', scheduleGeneration)
  .on('addDir', scheduleGeneration)
  .on('unlinkDir', scheduleGeneration)

console.log('Observando cambios en src/templates...')
