import { chmod, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { main } from './cli'
import { createProject, updateSkills } from './project'

const temporaryDirectories: string[] = []
const initialCwd = process.cwd()
const initialEnvironment = {
  PATH: process.env.PATH,
  FRAMEKIT_TEST_FAIL: process.env.FRAMEKIT_TEST_FAIL,
  npm_config_user_agent: process.env.npm_config_user_agent,
}

type RecordedCommand = { args: string[], cwd: string }

async function createTemporaryDirectory(prefix: string): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

async function createFakeCommand(binDirectory: string, name: string, source: string): Promise<void> {
  await mkdir(binDirectory, { recursive: true })
  if (process.platform === 'win32') {
    const script = path.join(binDirectory, `${name}.mjs`)
    await writeFile(script, source, 'utf8')
    await writeFile(
      path.join(binDirectory, `${name}.cmd`),
      `@echo off\r\n"${process.execPath}" "${script}" %*\r\nexit /b %errorlevel%\r\n`,
      'utf8',
    )
    return
  }

  const executable = path.join(binDirectory, name)
  await writeFile(executable, `#!${process.execPath}\n${source}`, 'utf8')
  await chmod(executable, 0o755)
}

async function createFakePnpm(binDirectory: string, logFile: string): Promise<void> {
  await createFakeCommand(binDirectory, 'pnpm', `
import { appendFile } from 'node:fs/promises'
if (process.argv[2] === '--version') {
  console.log('11.14.0')
  process.exit(0)
}
await appendFile(${JSON.stringify(logFile)}, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
if (process.env.FRAMEKIT_TEST_FAIL === process.argv[2]) process.exit(7)
`)
}

async function createFakeNpm(binDirectory: string, logFile: string): Promise<void> {
  await createFakeCommand(binDirectory, 'npm', `
import { appendFile } from 'node:fs/promises'
await appendFile(${JSON.stringify(logFile)}, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
if (process.env.FRAMEKIT_TEST_FAIL === process.argv[2]) process.exit(7)
`)
}

async function createFakeGit(binDirectory: string, logFile: string): Promise<void> {
  await createFakeCommand(binDirectory, 'git', `
import { appendFile } from 'node:fs/promises'
await appendFile(${JSON.stringify(logFile)}, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
`)
}

const mockState = { answers: [] as string[], index: 0 }

function setPromptAnswers(...answers: string[]): void {
  mockState.answers = answers
  mockState.index = 0
}

function expectAllPromptAnswersUsed(): void {
  expect(mockState.index).toBe(mockState.answers.length)
}

vi.mock('node:readline/promises', () => ({
  createInterface() {
    return {
      question(label: string): Promise<string> {
        const answer = mockState.answers[mockState.index]
        if (answer === undefined) throw new Error(`Unexpected prompt: ${label}`)
        mockState.index += 1
        return Promise.resolve(answer)
      },
      close() {},
    }
  },
}))

async function readCommandLog(logFile: string): Promise<RecordedCommand[]> {
  let content: string
  try {
    content = await readFile(logFile, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }

  return content.trim() === ''
    ? []
    : content.trim().split('\n').map((line) => JSON.parse(line) as RecordedCommand)
}

function expectCommands(
  commands: RecordedCommand[],
  destination: string,
  expectedArgs: string[][],
): void {
  expect(commands).toEqual(expectedArgs.map((args) => ({ args, cwd: destination })))
}

async function expectProjectFiles(
  destination: string,
  packageManager: 'pnpm' | 'npm',
): Promise<void> {
  const packageJson = JSON.parse(await readFile(path.join(destination, 'package.json'), 'utf8')) as Record<string, unknown> & {
    dependencies: Record<string, string>
  }
  expect(path.isAbsolute(destination)).toBe(true)
  expect(packageJson).toMatchObject({
    name: 'framekit-project',
    private: true,
    type: 'module',
    engines: { node: '>=22.13.0', pnpm: '>=11.14.0' },
    scripts: {
      dev: 'framekit dev',
      build: 'framekit build',
      start: 'framekit start',
      check: 'framekit check',
    },
  })
  expect(packageJson.dependencies['@mauriciodmo/framekit']).toBeTypeOf('string')
  await expect(readFile(path.join(destination, '.gitignore'), 'utf8')).resolves.toContain('.framekit')
  await expect(readFile(path.join(destination, '_gitignore'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  await expect(readFile(path.join(destination, 'src', 'templates', 'example', 'template.tsx'), 'utf8')).resolves.toContain('defineTemplate')
  await expect(readFile(path.join(destination, 'src', 'app', 'page.tsx'), 'utf8')).resolves.toContain("redirect('/editor')")

  const skills = (await readdir(path.join(destination, '.agents', 'skills'))).sort()
  expect(skills).toEqual(['fk-brand', 'fk-setup', 'fk-studio', 'fk-templates'])
  for (const skill of skills) {
    await expect(readFile(path.join(destination, '.agents', 'skills', skill, 'SKILL.md'), 'utf8')).resolves.toContain(`name: ${skill}`)
  }

  if (packageManager === 'pnpm') {
    await expect(readFile(path.join(destination, 'pnpm-workspace.yaml'), 'utf8')).resolves.toContain('allowBuilds')
  } else {
    await expect(readFile(path.join(destination, 'pnpm-workspace.yaml'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  }
}

function restoreEnvironment(): void {
  process.chdir(initialCwd)
  for (const [name, value] of Object.entries(initialEnvironment)) {
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
}

afterEach(async () => {
  restoreEnvironment()
  mockState.answers = []
  mockState.index = 0
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

    it('copies the template and runs install then generate (pnpm)', async () => {
      const root = await createTemporaryDirectory('create-framekit-success-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      const destination = await createProject(path.join(root, 'nested', '..', 'project'), 'pnpm', {
        installDependencies: true,
        runApproveBuilds: false,
        initGit: false,
      })

      expect(destination).toBe(path.join(root, 'project'))
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [
        ['install'],
        ['framekit', 'generate'],
      ])
      await expect(readFile(path.join(destination, '.gitignore'), 'utf8')).resolves.toContain('next-env.d.ts')
    })

    it('keeps project when install fails', async () => {
      const root = await createTemporaryDirectory('create-framekit-failure-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.FRAMEKIT_TEST_FAIL = 'install'
      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      const destination = path.join(root, 'project')
      await expect(
        createProject(destination, 'pnpm', {
          installDependencies: true,
          runApproveBuilds: false,
          initGit: false,
        }),
      ).rejects.toThrow('Command failed: pnpm install')
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [['install']])
    })

    it('keeps project when generate fails', async () => {
      const root = await createTemporaryDirectory('create-framekit-gen-failure-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.FRAMEKIT_TEST_FAIL = 'framekit'
      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      const destination = path.join(root, 'project')
      await expect(
        createProject(destination, 'pnpm', {
          installDependencies: true,
          runApproveBuilds: false,
          initGit: false,
        }),
      ).rejects.toThrow('Command failed: pnpm framekit generate')
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [
        ['install'],
        ['framekit', 'generate'],
      ])
    })

    it('skips install and generate when installDependencies is false', async () => {
      const root = await createTemporaryDirectory('create-framekit-no-install-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      const destination = path.join(root, 'project')
      await createProject(destination, 'pnpm', {
        installDependencies: false,
        runApproveBuilds: false,
        initGit: false,
      })
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [])
    })

    it('runs approve-builds for pnpm when requested', async () => {
      const root = await createTemporaryDirectory('create-framekit-approve-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      const destination = path.join(root, 'project')
      await createProject(destination, 'pnpm', {
        installDependencies: true,
        runApproveBuilds: true,
        initGit: false,
      })
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [
        ['install'],
        ['approve-builds'],
        ['framekit', 'generate'],
      ])
    })

    it('does not run approve-builds when installDependencies is false', async () => {
      const root = await createTemporaryDirectory('create-framekit-no-approve-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      const destination = path.join(root, 'project')
      await createProject(destination, 'pnpm', {
        installDependencies: false,
        runApproveBuilds: true,
        initGit: false,
      })
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [])
    })

    it('runs git init, add -A, commit when initGit is true', async () => {
      const root = await createTemporaryDirectory('create-framekit-git-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakeGit(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      const destination = path.join(root, 'project')
      await createProject(destination, 'pnpm', {
        installDependencies: false,
        runApproveBuilds: false,
        initGit: true,
      })
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [
        ['init'],
        ['add', '-A'],
        ['commit', '-m', 'Initial FrameKit project'],
      ])
    })

    it('removes pnpm-workspace.yaml and preserves runtime engines when pm=npm', async () => {
      const root = await createTemporaryDirectory('create-framekit-npm-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakeNpm(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      const destination = path.join(root, 'project')
      await createProject(destination, 'npm', {
        installDependencies: true,
        runApproveBuilds: false,
        initGit: false,
      })
      await expectProjectFiles(destination, 'npm')
      expectCommands(await readCommandLog(log), destination, [
        ['install'],
        ['exec', '--', 'framekit', 'generate'],
      ])
    })
  })

  describe('main', () => {
    it('updates the official skills without removing custom skills', async () => {
      const root = await createTemporaryDirectory('create-framekit-update-skills-')
      const project = path.join(root, 'project')
      await mkdir(path.join(project, '.agents', 'skills', 'framekit-project-setup'), { recursive: true })
      await mkdir(path.join(project, '.agents', 'skills', 'custom-skill'), { recursive: true })
      await writeFile(path.join(project, '.agents', 'skills', 'framekit-project-setup', 'SKILL.md'), 'legacy', 'utf8')
      await writeFile(path.join(project, '.agents', 'skills', 'custom-skill', 'SKILL.md'), 'custom', 'utf8')

      await main(['update-skills', project])

      expect(await updateSkills(project)).toBe(project)
      expect((await readdir(path.join(project, '.agents', 'skills'))).sort()).toEqual([
        'custom-skill',
        'fk-brand',
        'fk-setup',
        'fk-studio',
        'fk-templates',
      ])
      await expect(readFile(path.join(project, '.agents', 'skills', 'fk-setup', 'SKILL.md'), 'utf8')).resolves.toContain('name: fk-setup')
      await expect(readFile(path.join(project, '.agents', 'skills', 'custom-skill', 'SKILL.md'), 'utf8')).resolves.toBe('custom')
      await expect(readFile(path.join(project, '.agents', 'skills', 'framekit-project-setup', 'SKILL.md'), 'utf8')).rejects.toThrow()
    })

    it('reports a missing project for update-skills', async () => {
      const root = await createTemporaryDirectory('create-framekit-missing-skills-')

      await expect(updateSkills(path.join(root, 'missing'))).rejects.toThrow(
        'The project directory does not exist',
      )
    })

    it('throws usage error when more than one arg', async () => {
      await expect(main(['one', 'two'])).rejects.toThrow(
        'Usage: create-framekit [project-directory] [-y|-n]',
      )
      await expect(main(['update-skills', 'one', 'two'])).rejects.toThrow(
        'Usage: create-framekit [project-directory] [-y|-n]',
      )
    })

    it('prompts for project name when no args and uses it', async () => {
      setPromptAnswers('my-project', 'pnpm', 'y', 'y', 'n')

      const root = await createTemporaryDirectory('create-framekit-interactive-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      delete process.env.npm_config_user_agent
      process.chdir(root)
      await main([])
      const destination = path.join(root, 'my-project')
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [
        ['install'],
        ['approve-builds'],
        ['framekit', 'generate'],
      ])
      expectAllPromptAnswersUsed()
    })

    it('uses provided project name from args', async () => {
      setPromptAnswers('y', 'y', 'n')

      const root = await createTemporaryDirectory('create-framekit-arg-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      process.env.npm_config_user_agent = 'pnpm/11.14.0'
      const destination = path.join(root, 'my-project')
      await main([destination])
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [
        ['install'],
        ['approve-builds'],
        ['framekit', 'generate'],
      ])
      expectAllPromptAnswersUsed()
    })

    it('uses framekit and skips all prompts with -n', async () => {
      const root = await createTemporaryDirectory('create-framekit-no-answers-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      delete process.env.npm_config_user_agent
      process.chdir(root)
      await main(['-n'])
      const destination = path.join(root, 'framekit')
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [])
    })

    it('uses framekit and accepts all prompts with -y', async () => {
      const root = await createTemporaryDirectory('create-framekit-yes-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakePnpm(bin, log)
      await createFakeGit(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      delete process.env.npm_config_user_agent
      process.chdir(root)
      await main(['-y'])
      const destination = path.join(root, 'framekit')
      await expectProjectFiles(destination, 'pnpm')
      expectCommands(await readCommandLog(log), destination, [
        ['install'],
        ['approve-builds'],
        ['framekit', 'generate'],
        ['init'],
        ['add', '-A'],
        ['commit', '-m', 'Initial FrameKit project'],
      ])
    })

    it('uses npm detected from the environment without pnpm commands', async () => {
      const root = await createTemporaryDirectory('create-framekit-main-npm-')
      const bin = path.join(root, 'bin')
      const log = path.join(root, 'commands.jsonl')
      await createFakeNpm(bin, log)
      await createFakeGit(bin, log)

      process.env.PATH = `${bin}${path.delimiter}${process.env.PATH ?? ''}`
      process.env.npm_config_user_agent = 'npm/10.8.0 node/v22.13.0'
      const destination = path.join(root, 'npm-project')
      await main([destination, '-y'])
      await expectProjectFiles(destination, 'npm')
      expectCommands(await readCommandLog(log), destination, [
        ['install'],
        ['exec', '--', 'framekit', 'generate'],
        ['init'],
        ['add', '-A'],
        ['commit', '-m', 'Initial FrameKit project'],
      ])
    })

    it('fails when interactive answers are exhausted', async () => {
      setPromptAnswers('project')

      await expect(main([])).rejects.toThrow('Unexpected prompt')
      expect(mockState.index).toBe(1)
    })

    it('rejects long flags and conflicting answer flags', async () => {
      await expect(main(['--y'])).rejects.toThrow(
        'Usage: create-framekit [project-directory] [-y|-n]',
      )
      await expect(main(['-y', '-n'])).rejects.toThrow(
        'Usage: create-framekit [project-directory] [-y|-n]',
      )
    })
  })
})
