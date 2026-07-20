import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { main } from './cli'
import { createProject } from './project'

const temporaryDirectories: string[] = []

async function createTemporaryDirectory(prefix: string): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

async function createFakePnpm(binDirectory: string, logFile: string): Promise<void> {
  const executable = path.join(binDirectory, 'pnpm')
  await mkdir(binDirectory, { recursive: true })
  await writeFile(
    executable,
    `#!/usr/bin/env node
import { appendFile } from 'node:fs/promises'
await appendFile(${JSON.stringify(logFile)}, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
if (process.env.FRAMEKIT_TEST_FAIL === process.argv[2]) process.exit(7)
`,
    'utf8',
  )
  await chmod(executable, 0o755)
}

function createFakeNpm(binDirectory: string, logFile: string): Promise<void> {
  const executable = path.join(binDirectory, 'npm')
  return mkdir(binDirectory, { recursive: true }).then(() =>
    writeFile(
      executable,
      `#!/usr/bin/env node
import { appendFile } from 'node:fs/promises'
await appendFile(${JSON.stringify(logFile)}, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
if (process.env.FRAMEKIT_TEST_FAIL === process.argv[2]) process.exit(7)
`,
      'utf8',
    ).then(() => chmod(executable, 0o755)),
  )
}

async function createFakeGit(binDirectory: string, logFile: string): Promise<void> {
  const executable = path.join(binDirectory, 'git')
  await mkdir(binDirectory, { recursive: true })
  await writeFile(
    executable,
    `#!/usr/bin/env node
import { appendFile } from 'node:fs/promises'
await appendFile(${JSON.stringify(logFile)}, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
`,
    'utf8',
  )
  await chmod(executable, 0o755)
}

const mockState = { answers: [] as string[], index: 0 }

vi.mock('node:readline/promises', () => ({
  createInterface() {
    return {
      question(): Promise<string> {
        return Promise.resolve(mockState.answers[mockState.index++] ?? '')
      },
      close() {},
    }
  },
}))

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('create-framekit', () => {
  describe('createProject', () => {
    it('requires no existing directory', async () => {
      const root = await createTemporaryDirectory('create-framekit-existing-')
      const destination = path.join(root, 'project')
      await mkdir(destination)
      await writeFile(path.join(destination, 'keep.txt'), 'keep', 'utf8')

      await expect(
        createProject(destination, 'pnpm', {
          installDependencies: false,
          runApproveBuilds: false,
          initGit: false,
        }),
      ).rejects.toThrow('The directory already exists')
      await expect(readFile(path.join(destination, 'keep.txt'), 'utf8')).resolves.toBe('keep')
    })

    it('copies template, runs install then generate (pnpm)', async () => {
      const root = await createTemporaryDirectory('create-framekit-success-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      const previousPath = process.env.PATH
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      try {
        const destination = await createProject(path.join(root, 'nested', '..', 'project'), 'pnpm', {
          installDependencies: true,
          runApproveBuilds: false,
          initGit: false,
        })
        const commands = (await readFile(log, 'utf8')).trim().split('\n').map((line) => JSON.parse(line))

        expect(destination).toBe(path.join(root, 'project'))
        expect(commands.map(({ args }: { args: string[] }) => args)).toEqual([
          ['install'],
          ['framekit', 'generate'],
        ])
        expect(commands.every(({ cwd }: { cwd: string }) => cwd === destination)).toBe(true)
        await expect(readFile(path.join(destination, '.gitignore'), 'utf8')).resolves.toContain('.framekit')
        await expect(readFile(path.join(destination, '.agents', 'skills', 'framekit-project-setup', 'SKILL.md'), 'utf8')).resolves.toContain('name: framekit-project-setup')
      } finally {
        process.env.PATH = previousPath
      }
    })

    it('keeps project when install fails', async () => {
      const root = await createTemporaryDirectory('create-framekit-failure-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      const previousPath = process.env.PATH
      process.env.FRAMEKIT_TEST_FAIL = 'install'
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      try {
        const destination = path.join(root, 'project')
        await expect(
          createProject(destination, 'pnpm', {
            installDependencies: true,
            runApproveBuilds: false,
            initGit: false,
          }),
        ).rejects.toThrow('Command failed: pnpm install')
        await expect(readFile(path.join(destination, 'package.json'), 'utf8')).resolves.toContain('framekit')
      } finally {
        process.env.PATH = previousPath
        delete process.env.FRAMEKIT_TEST_FAIL
      }
    })

    it('keeps project when generate fails', async () => {
      const root = await createTemporaryDirectory('create-framekit-gen-failure-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      const previousPath = process.env.PATH
      process.env.FRAMEKIT_TEST_FAIL = 'framekit'
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      try {
        const destination = path.join(root, 'project')
        await expect(
          createProject(destination, 'pnpm', {
            installDependencies: true,
            runApproveBuilds: false,
            initGit: false,
          }),
        ).rejects.toThrow('Command failed: pnpm framekit generate')
        await expect(readFile(path.join(destination, 'package.json'), 'utf8')).resolves.toContain('framekit')
      } finally {
        process.env.PATH = previousPath
        delete process.env.FRAMEKIT_TEST_FAIL
      }
    })

    it('skips install and generate when installDependencies is false', async () => {
      const root = await createTemporaryDirectory('create-framekit-no-install-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      const previousPath = process.env.PATH
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      try {
        const destination = path.join(root, 'project')
        await createProject(destination, 'pnpm', {
          installDependencies: false,
          runApproveBuilds: false,
          initGit: false,
        })
        const logContent = await readFile(log, 'utf8').catch(() => '')
        expect(logContent).toBe('')
        await expect(readFile(path.join(destination, 'package.json'), 'utf8')).resolves.toContain('framekit')
      } finally {
        process.env.PATH = previousPath
      }
    })

    it('runs approve-builds for pnpm when requested', async () => {
      const root = await createTemporaryDirectory('create-framekit-approve-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      const previousPath = process.env.PATH
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      try {
        const destination = path.join(root, 'project')
        await createProject(destination, 'pnpm', {
          installDependencies: true,
          runApproveBuilds: true,
          initGit: false,
        })
        const commands = (await readFile(log, 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
        expect(commands.map(({ args }: { args: string[] }) => args)).toEqual([
          ['install'],
          ['approve-builds'],
          ['framekit', 'generate'],
        ])
      } finally {
        process.env.PATH = previousPath
      }
    })

    it('does not run approve-builds when installDependencies is false', async () => {
      const root = await createTemporaryDirectory('create-framekit-no-approve-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      const previousPath = process.env.PATH
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      try {
        const destination = path.join(root, 'project')
        await createProject(destination, 'pnpm', {
          installDependencies: false,
          runApproveBuilds: true,
          initGit: false,
        })
        const logContent = await readFile(log, 'utf8').catch(() => '')
        expect(logContent).toBe('')
      } finally {
        process.env.PATH = previousPath
      }
    })

    it('runs git init, add -A, commit when initGit is true', async () => {
      const root = await createTemporaryDirectory('create-framekit-git-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, path.join(root, 'pnpm.log'))
      await createFakeGit(bin, log)

      const previousPath = process.env.PATH
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      try {
        const destination = path.join(root, 'project')
        await createProject(destination, 'pnpm', {
          installDependencies: false,
          runApproveBuilds: false,
          initGit: true,
        })
        const commands = (await readFile(log, 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
        expect(commands.map(({ args }: { args: string[] }) => args)).toEqual([
          ['init'],
          ['add', '-A'],
          ['commit', '-m', 'Initial FrameKit project'],
        ])
      } finally {
        process.env.PATH = previousPath
      }
    })

    it('removes pnpm-workspace.yaml and engine.pnpm when pm=npm', async () => {
      const root = await createTemporaryDirectory('create-framekit-npm-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakeNpm(bin, log)

      const previousPath = process.env.PATH
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      try {
        const destination = path.join(root, 'project')
        await createProject(destination, 'npm', {
          installDependencies: true,
          runApproveBuilds: false,
          initGit: false,
        })
        await expect(readFile(path.join(destination, 'pnpm-workspace.yaml'), 'utf8')).rejects.toThrow()
        const pkg = JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8'))
        expect(pkg.engines?.pnpm).toBeUndefined()
        const commands = (await readFile(log, 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
        expect(commands.map(({ args }: { args: string[] }) => args)).toEqual([
          ['install'],
          ['exec', '--', 'framekit', 'generate'],
        ])
      } finally {
        process.env.PATH = previousPath
      }
    })
  })

  describe('main', () => {
    it('throws usage error when more than one arg', async () => {
      await expect(main(['one', 'two'])).rejects.toThrow('Usage: create-framekit [project-directory]')
    })

    it('prompts for project name when no args and uses it', async () => {
      mockState.answers = ['my-project', 'y', 'y', 'n']
      mockState.index = 0

      const root = await createTemporaryDirectory('create-framekit-interactive-')
      const bin = path.join(root, 'bin')
      await createFakePnpm(bin, path.join(root, 'pnpm.log'))

      const previousPath = process.env.PATH
      const previousCwd = process.cwd()
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      process.env.npm_config_user_agent = 'pnpm/11.14.0'
      try {
        process.chdir(root)
        await main([])
      } finally {
        process.env.PATH = previousPath
        process.chdir(previousCwd)
        delete process.env.npm_config_user_agent
      }
    })

    it('uses provided project name from args', async () => {
      mockState.answers = ['y', 'y', 'n']
      mockState.index = 0

      const root = await createTemporaryDirectory('create-framekit-arg-')
      const bin = path.join(root, 'bin')
      await createFakePnpm(bin, path.join(root, 'pnpm.log'))

      const previousPath = process.env.PATH
      process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
      process.env.npm_config_user_agent = 'pnpm/11.14.0'
      try {
        await main([path.join(root, 'my-project')])
      } finally {
        process.env.PATH = previousPath
        delete process.env.npm_config_user_agent
      }
    })
  })
})
