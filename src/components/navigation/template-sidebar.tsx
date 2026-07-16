'use client'

import { Images } from 'lucide-react'

import type { Locale } from '@/i18n/locales'
import type { getMessages } from '@/i18n/messages'
import type { TemplateNavigationNode } from '@/lib/templates/types'

import { LanguageSelect } from './language-select'
import { NavigationNode } from './navigation-node'

export function TemplateSidebar({
  navigation,
  locale,
  messages,
}: {
  navigation: TemplateNavigationNode[]
  locale: Locale
  messages: ReturnType<typeof getMessages>['sidebar']
}) {
  return (
    <aside className="flex flex-col border-b border-white/10 bg-[#10271f] text-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
      <header className="flex h-[82px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#c8f7d9] text-[#10271f]">
            <Images size={20} strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-black tracking-[-0.02em]">Image Studio</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[#91ae9f]">
              {messages.workshop}
            </p>
          </div>
        </div>
      </header>

      <nav
        aria-label={messages.navigationLabel}
        className="max-h-[38vh] overflow-y-auto p-3 lg:min-h-0 lg:max-h-none lg:flex-1"
      >
        {navigation.length === 0 ? (
          <p className="px-3 py-4 text-sm text-[#91ae9f]">
            {messages.noTemplates}
          </p>
        ) : (
          navigation.map((node) => (
            <NavigationNode key={node.id} node={node} level={0} />
          ))
        )}
      </nav>

      <div className="shrink-0 border-t border-white/10 px-5 py-4">
        <LanguageSelect locale={locale} messages={messages} />
      </div>
    </aside>
  )
}
