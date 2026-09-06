import type { EditorMessages } from '../../../editor/types'
import enMessages from './en'
import esMessages from './es'

export type FrameKitLocale = 'es' | 'en'

export interface FrameKitStudioMessages {
  metadata: { title: string, description: string }
  sidebar: {
    workshop: string, navigationLabel: string, templatesLabel: string, brandsLabel: string
    noTemplates: string, noBrands: string, languageLabel: string
    collapseLabel: string, expandLabel: string
    settingsLabel: string, themeToggleLabel: string, developedBy: string
    languageNames: Record<FrameKitLocale, string>
  }
  editor: EditorMessages & { loadingLabel: string, loadError: string, invalidDefinition: string, dataError: string }
  brand: {
    componentLabel: string, previewLabel: string, descriptionLabel: string, editHint: string, loadingLabel: string, loadError: string
    badgeLabel: string, sourceLabel: string
    emptyTitle: string, emptyDescription: string, notFoundTitle: string, notFoundDescription: string
  }
  emptyState: { ready: string, title: string, description: string }
  notFound: { statusLabel: string, title: string, description: string, backToEditor: string }
}

export const frameKitMessages: Record<FrameKitLocale, FrameKitStudioMessages> = {
  es: esMessages,
  en: enMessages
}

export function getFrameKitLocale (value?: string | null): FrameKitLocale {
  return value?.toLowerCase().startsWith('en') ? 'en' : 'es'
}
