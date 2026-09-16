import { vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  copyTemplate: vi.fn().mockResolvedValue(undefined),
  exportTemplate: vi.fn().mockResolvedValue(undefined),
  ExportValidationError: class ExportValidationError extends Error {
    constructor (readonly fields: Record<string, unknown>) {
      super('Image export data is invalid')
    }
  }
}))

vi.mock('@/editor/export/export-template', () => mocks)

export const copyTemplateMock = mocks.copyTemplate
export const exportTemplateMock = mocks.exportTemplate
export const ExportValidationErrorMock = mocks.ExportValidationError
