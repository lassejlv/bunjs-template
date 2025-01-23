import { $ } from 'bun'
import fs from 'fs'
import path from 'path'
import consola from 'consola'

const devMode = process.argv[2] === 'dev'
let currentProcess: any = null
const validFileExt: string[] = ['.ts', '.tsx']

async function build() {
  consola.info('Building...')

  // Step 1, install dependencies
  await $`bun install`.quiet()

  // Step 2, build to javascript and then to a single file executable
  await $`bun build --format esm --minify --target bun ./src/main.ts --outdir dist`.quiet()

  // Step 3, build the executable
  await $`bun build --compile --minify --target bun ./dist/main.js --outfile main`.quiet()
  await $`rm -rf dist`.quiet()

  consola.success('Build complete!')
}

async function runExecutable() {
  // Kill the previous process if it exists
  if (currentProcess) {
    currentProcess.kill()
  }

  consola.info('Starting program...')
  // Start the new process and store the reference
  currentProcess = Bun.spawn(['./main'], {
    stdio: ['inherit', 'inherit', 'inherit'],
  })
}

async function watchAndRerun() {
  // Initial build and run
  await build()
  await runExecutable()

  consola.info('Watching for changes... Press Ctrl+C to stop')
  consola.info('File extensions to watch: ' + validFileExt.join(', '))

  // Watch for changes
  fs.watch('./src', async (eventType, filename) => {
    consola.info(`File changed: ${filename}`)

    if (filename && !validFileExt.includes(path.extname(filename))) {
      return
    }

    console.clear()
    await build()
    await runExecutable()
  })
}

if (devMode) {
  watchAndRerun()
} else {
  build()
}
