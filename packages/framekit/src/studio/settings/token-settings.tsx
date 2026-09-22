'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { toast } from '@/editor/toast'
import type { FrameKitLocale } from '@/studio/i18n/messages'
import { requestStudioJson } from './api'
import { ConfirmationDialog } from './confirmation-dialog'
import { Feedback, SettingsCard } from './settings-components'
import type { CreatedStudioToken, SettingsMessages, StudioTokenMetadata } from './types'
import { errorMessage, inputClass, jsonRequest, primaryButtonClass, readOwnTokens, secondaryButtonClass } from './settings-utils'
import { TokenMetadataList } from './token-list'

type TokenSettingsProps = {
  locale: FrameKitLocale
  closeLabel: string
  messages: SettingsMessages['tokens']
  errors: SettingsMessages['errors']
  enabled: boolean
}

export function TokenSettings ({ locale, closeLabel, messages, errors, enabled }: TokenSettingsProps) {
  const [tokens, setTokens] = useState<StudioTokenMetadata[]>([])
  const [loading, setLoading] = useState(enabled)
  const [listFeedback, setListFeedback] = useState<string>()
  const [tokenName, setTokenName] = useState('')
  const [newToken, setNewToken] = useState<CreatedStudioToken>()
  const [createPending, setCreatePending] = useState(false)
  const [confirmingToken, setConfirmingToken] = useState<StudioTokenMetadata>()
  const createPendingRef = useRef(false)
  const revokePendingRef = useRef(false)
  const toastOptions = { closeLabel, position: 'top-center' as const }

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setLoading(true)
    readOwnTokens().then((value) => {
      if (cancelled) return
      setTokens(value)
      setListFeedback(undefined)
    }).catch((error) => {
      if (!cancelled) setListFeedback(errorMessage(error, errors))
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [enabled, errors])

  async function refreshTokens () {
    try {
      setTokens(await readOwnTokens())
      setListFeedback(undefined)
    } catch (error) {
      setListFeedback(errorMessage(error, errors))
    }
  }

  async function createToken (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (createPendingRef.current) return

    createPendingRef.current = true
    setCreatePending(true)
    try {
      const created = await requestStudioJson<CreatedStudioToken>('/api/framekit/tokens', jsonRequest('POST', { name: tokenName }))
      setNewToken(created)
      setTokenName('')
      toast.success(messages.createdMessage, toastOptions)
      await refreshTokens()
    } catch (error) {
      toast.error(errorMessage(error, errors), toastOptions)
    } finally {
      createPendingRef.current = false
      setCreatePending(false)
    }
  }

  async function revokeToken () {
    if (!confirmingToken || revokePendingRef.current) return

    revokePendingRef.current = true
    try {
      await requestStudioJson<{ status: string }>(`/api/framekit/tokens/${encodeURIComponent(confirmingToken.id)}`, { method: 'DELETE' })
      setConfirmingToken(undefined)
      await refreshTokens()
    } catch (error) {
      toast.error(errorMessage(error, errors), toastOptions)
      setConfirmingToken(undefined)
    } finally {
      revokePendingRef.current = false
    }
  }

  return (
    <SettingsCard id="framekit-settings-tokens" title={messages.title} description={messages.description} className="xl:col-span-2">
      <form onSubmit={createToken} aria-busy={createPending} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label htmlFor="framekit-settings-token-name" className="block min-w-0 flex-1 text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
          {messages.nameLabel}
          <input id="framekit-settings-token-name" name="name" type="text" required maxLength={80} value={tokenName} disabled={createPending} onChange={(event) => setTokenName(event.target.value)} className={inputClass} />
        </label>
        <button type="submit" disabled={createPending} className={primaryButtonClass}>{createPending ? messages.creatingLabel : messages.createLabel}</button>
      </form>
      {newToken && (
        <aside aria-label={messages.createdLabel} className="mt-5 border-y border-fk-mint-300/40 py-4 dark:border-fk-mint-200/40">
          <p className="text-sm font-black text-fk-forest-400 dark:text-fk-mint-100">{messages.createdLabel}</p>
          <p className="mt-2 break-all border-y border-fk-mint-300/40 py-3 font-mono text-sm text-fk-forest-400 dark:border-fk-mint-200/30 dark:text-fk-sage-100">{newToken.token}</p>
          <p className="mt-2 text-sm leading-6 text-fk-forest-400 dark:text-fk-sage-100">{messages.secretWarning}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={async () => {
              try {
                if (!navigator.clipboard) throw new Error('Clipboard unavailable')
                await navigator.clipboard.writeText(newToken.token)
                toast.success(messages.copiedLabel, toastOptions)
              } catch {
                toast.error(messages.copyError, toastOptions)
              }
            }} className={primaryButtonClass}>{messages.copyLabel}</button>
            <button type="button" onClick={() => setNewToken(undefined)} className={secondaryButtonClass}>{messages.dismissSecretLabel}</button>
          </div>
        </aside>
      )}

      <div className="mt-6 border-t border-fk-ivory-400 pt-5 dark:border-white/10">
        {loading && <p aria-busy="true" className="mt-4 text-sm text-fk-sage-400 dark:text-fk-sage-200">{messages.loadingLabel}</p>}
        <Feedback message={listFeedback} />
        {!loading && !listFeedback && <TokenMetadataList tokens={tokens} locale={locale} messages={messages} onRequestRevoke={setConfirmingToken} />}
      </div>

      <ConfirmationDialog
        open={confirmingToken !== undefined}
        title={messages.revokeTitle}
        description={messages.revokeDescription}
        confirmLabel={messages.confirmRevokeLabel}
        cancelLabel={messages.cancelLabel}
        onCancel={() => setConfirmingToken(undefined)}
        onConfirm={revokeToken}
      />
    </SettingsCard>
  )
}
