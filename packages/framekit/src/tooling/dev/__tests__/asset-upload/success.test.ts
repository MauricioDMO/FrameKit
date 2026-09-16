// @vitest-environment node

import { readFile, rm } from 'node:fs/promises'

import { describe, expect, it, vi } from 'vitest'

import { handleAssetUpload } from '@/tooling/dev/asset-upload/index'

import {
  createProject,
  expectJsonResponse,
  newAssetBytes,
  oldAssetBytes,
  requestFor,
  responseFor,
  uploadBody
} from './support'

function deferred (): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void
  const promise = new Promise<void>((_resolve) => {
    resolve = _resolve
  })
  return { promise, resolve }
}

describe('handleAssetUpload success', () => {
  it.each(['hero', 'language'])('replaces a %s variant asset and regenerates the manifest', async (fieldKey) => {
    const project = await createProject(fieldKey)
    const regenerationStarted = deferred()
    const releaseRegeneration = deferred()
    const regenerate = vi.fn(async () => {
      regenerationStarted.resolve()
      await releaseRegeneration.promise
    })
    const response = responseFor()
    const upload = handleAssetUpload(requestFor(uploadBody({ fieldKey })), response, { projectRoot: project.root, regenerate })

    try {
      await expect(readFile(project.oldAsset)).resolves.toEqual(oldAssetBytes)
      await regenerationStarted.promise
      expect(response.body).toBeUndefined()
      expect(response.headers).toEqual({})
      await expect(readFile(project.oldAsset)).rejects.toMatchObject({ code: 'ENOENT' })
      await expect(readFile(project.newAsset)).resolves.toEqual(newAssetBytes)

      releaseRegeneration.resolve()
      await expect(upload).resolves.toBe(true)
      expect(regenerate).toHaveBeenCalledOnce()
      expectJsonResponse(response, 200, { status: 'ok' })
    } finally {
      releaseRegeneration.resolve()
      await upload.catch(() => undefined)
      await rm(project.root, { recursive: true, force: true })
    }
  })
})
