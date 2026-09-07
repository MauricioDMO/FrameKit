import { vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  copyTemplate: vi.fn().mockResolvedValue(undefined),
  exportTemplate: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/editor/export/export-template', () => mocks)

export const copyTemplateMock = mocks.copyTemplate
export const exportTemplateMock = mocks.exportTemplate
