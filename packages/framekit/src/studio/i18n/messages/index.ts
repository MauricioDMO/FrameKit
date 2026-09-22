import type { EditorMessages } from '@/editor/types'
import enMessages from './en'
import esMessages from './es'

export type FrameKitLocale = 'es' | 'en'

export interface FrameKitStudioMessages {
  metadata: { title: string, description: string }
  login: {
    title: string, description: string, usernameLabel: string, passwordLabel: string
    submitLabel: string, pendingLabel: string, invalidCredentials: string, serverError: string
  }
  sidebar: {
    workshop: string, navigationLabel: string, templatesLabel: string, brandsLabel: string
    noTemplates: string, noBrands: string, languageLabel: string
    collapseLabel: string, expandLabel: string
    settingsLabel: string, appearanceLabel: string, themeToggleLabel: string, developedBy: string
    languageNames: Record<FrameKitLocale, string>
  }
  editor: EditorMessages & { loadingLabel: string, loadError: string, invalidDefinition: string, dataError: string }
  brand: {
    componentLabel: string, previewLabel: string, descriptionLabel: string, editHint: string, loadingLabel: string, loadError: string
    badgeLabel: string, sourceLabel: string
    emptyTitle: string, emptyDescription: string, notFoundTitle: string, notFoundDescription: string
  }
  settings: {
    title: string, description: string, navigationLabel: string, closeLabel: string
    account: {
      title: string, description: string, usernameLabel: string, roleLabel: string
      administratorRole: string, userRole: string, saveUsernameLabel: string
      savingUsernameLabel: string, usernameUpdated: string, passwordTitle: string
      currentPasswordLabel: string, newPasswordLabel: string, changePasswordLabel: string
      changingPasswordLabel: string, logoutLabel: string, loggingOutLabel: string
      sessionRequired: string
    }
    tokens: {
      title: string, description: string, nameLabel: string, createLabel: string
      creatingLabel: string, loadingLabel: string, empty: string, copyLabel: string
      copiedLabel: string, copyError: string, secretWarning: string, dismissSecretLabel: string
      createdMessage: string, createdLabel: string, prefixLabel: string, createdAtLabel: string
      lastUsedLabel: string, revokedAtLabel: string, activeLabel: string, revokedLabel: string
      neverLabel: string, revokeLabel: string, revokeTitle: string, revokeDescription: string
      confirmRevokeLabel: string, cancelLabel: string
    }
    users: {
      title: string, description: string, createTitle: string, usernameLabel: string
      passwordLabel: string, roleLabel: string, userRole: string, administratorRole: string
      editLabel: string, createLabel: string, creatingLabel: string, loadingLabel: string, empty: string
      activeLabel: string, inactiveLabel: string, saveLabel: string, savingLabel: string
      resetPasswordTitle: string, resetPasswordLabel: string, resettingPasswordLabel: string
      deleteLabel: string, deleteTitle: string, deleteDescription: string
      confirmDeleteLabel: string, tokensLabel: string, tokenTitle: string, noTokens: string
    }
    errors: {
      invalid: string, unauthorized: string, forbidden: string, notFound: string
      conflict: string, server: string, network: string
    }
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
