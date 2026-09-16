'use client'

import type { FrameKitLocale } from '../i18n/messages'
import type { SettingsMessages, StudioTokenMetadata } from './types'
import { dangerButtonClass, formatTimestamp } from './settings-utils'

export function TokenMetadataList ({ tokens, locale, messages, onRequestRevoke }: { tokens: readonly StudioTokenMetadata[], locale: FrameKitLocale, messages: SettingsMessages['tokens'], onRequestRevoke?: (token: StudioTokenMetadata) => void }) {
  if (tokens.length === 0) return <p className="mt-5 text-sm text-fk-sage-400 dark:text-fk-sage-200">{messages.empty}</p>

  return (
    <ul className="mt-5 space-y-3">
      {tokens.map((token) => {
        const revoked = token.revokedAt !== null
        return (
          <li key={token.id} className="rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-fk-forest-100/60">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words font-bold text-fk-forest-400 dark:text-fk-sage-100">{token.name}</h3>
                <p className="mt-1 break-all font-mono text-xs text-fk-sage-400 dark:text-fk-sage-300">{token.tokenPrefix}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${revoked ? 'bg-fk-ivory-300 text-fk-sage-400 dark:bg-fk-forest-300 dark:text-fk-sage-200' : 'bg-fk-mint-100 text-fk-forest-400 dark:bg-fk-mint-200/20 dark:text-fk-mint-100'}`}>
                {revoked ? messages.revokedLabel : messages.activeLabel}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-bold text-fk-sage-400 dark:text-fk-sage-300">{messages.createdAtLabel}</dt>
                <dd className="mt-1 text-fk-forest-400 dark:text-fk-sage-100">{formatTimestamp(token.createdAt, locale, messages.neverLabel)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-fk-sage-400 dark:text-fk-sage-300">{messages.lastUsedLabel}</dt>
                <dd className="mt-1 text-fk-forest-400 dark:text-fk-sage-100">{formatTimestamp(token.lastUsedAt, locale, messages.neverLabel)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-fk-sage-400 dark:text-fk-sage-300">{messages.revokedAtLabel}</dt>
                <dd className="mt-1 text-fk-forest-400 dark:text-fk-sage-100">{formatTimestamp(token.revokedAt, locale, messages.neverLabel)}</dd>
              </div>
            </dl>
            {!revoked && onRequestRevoke && <button type="button" onClick={() => onRequestRevoke(token)} className={`${dangerButtonClass} mt-4`}>{messages.revokeLabel}</button>}
          </li>
        )
      })}
    </ul>
  )
}

export function UserTokens ({ tokens, locale, messages, emptyLabel, onRequestRevoke }: { tokens: readonly StudioTokenMetadata[], locale: FrameKitLocale, messages: SettingsMessages['tokens'], emptyLabel: string, onRequestRevoke: (token: StudioTokenMetadata) => void }) {
  return (
    <div className="mt-4 rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-fk-forest-100/60">
      <h4 className="font-bold text-fk-forest-400 dark:text-fk-sage-100">{messages.title}</h4>
      {tokens.length === 0
        ? <p className="mt-3 text-sm text-fk-sage-400 dark:text-fk-sage-200">{emptyLabel}</p>
        : <TokenMetadataList tokens={tokens} locale={locale} messages={messages} onRequestRevoke={onRequestRevoke} />}
    </div>
  )
}
