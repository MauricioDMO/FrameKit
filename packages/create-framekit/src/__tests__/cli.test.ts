import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { createProject, updateSkills } from '@/project'

const temporaryDirectories: string[] = []

async function createTemporaryDirectory (prefix: string): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  )
})

describe('create-framekit project helpers', () => {
  it('creates a project without installing dependencies', async () => {
    const root = await createTemporaryDirectory('create-framekit-project-')
    const destination = await createProject(path.join(root, 'project'), 'pnpm', {
      installDependencies: false,
      runApproveBuilds: false,
      initGit: false
    })

    expect(destination).toBe(path.join(root, 'project'))
    await expect(readFile(path.join(destination, 'package.json'), 'utf8')).resolves.toContain('@mauriciodmo/framekit')
    await expect(readFile(path.join(destination, '.gitignore'), 'utf8')).resolves.toContain('.framekit-data/')
    expect((await readdir(path.join(destination, '.agents', 'skills'))).sort()).toEqual([
      'fk-brand',
      'fk-design',
      'fk-setup',
      'fk-studio',
      'fk-templates'
    ])
  })

  it('rejects an existing destination', async () => {
    const root = await createTemporaryDirectory('create-framekit-existing-')
    const destination = path.join(root, 'project')
    await mkdir(destination)

    await expect(
      createProject(destination, 'pnpm', {
        installDependencies: false,
        runApproveBuilds: false,
        initGit: false
      })
    ).rejects.toThrow('The directory already exists')
  })

  it('updates official skills and preserves custom skills', async () => {
    const root = await createTemporaryDirectory('create-framekit-skills-')
    const project = path.join(root, 'project')
    const skillsDirectory = path.join(project, '.agents', 'skills')

    await mkdir(path.join(skillsDirectory, 'custom-skill'), { recursive: true })
    await mkdir(path.join(skillsDirectory, 'fk-setup'), { recursive: true })
    await writeFile(path.join(skillsDirectory, 'custom-skill', 'SKILL.md'), 'custom', 'utf8')
    await writeFile(path.join(skillsDirectory, 'fk-setup', 'SKILL.md'), 'replace me', 'utf8')

    expect(await updateSkills(project)).toBe(project)
    expect((await readdir(skillsDirectory)).sort()).toEqual([
      'custom-skill',
      'fk-brand',
      'fk-design',
      'fk-setup',
      'fk-studio',
      'fk-templates'
    ])
    await expect(readFile(path.join(skillsDirectory, 'custom-skill', 'SKILL.md'), 'utf8')).resolves.toBe('custom')
    await expect(readFile(path.join(skillsDirectory, 'fk-setup', 'SKILL.md'), 'utf8')).resolves.toContain('name: fk-setup')
  })

  it('reports a missing project for update-skills', async () => {
    const root = await createTemporaryDirectory('create-framekit-missing-')

    await expect(updateSkills(path.join(root, 'missing'))).rejects.toThrow(
      'The project directory does not exist'
    )
  })
})
