'use client'

import { Images, Moon, Settings, Sun } from 'lucide-react'
import { useState } from 'react'

import { useLocale } from '@/i18n/locale-provider'
import type { TemplateNavigationNode } from '@/lib/templates/manifest-to-navigation'

import { LanguageSelect } from './language-select'
import { NavigationNode } from './navigation-node'

export function TemplateSidebar({
  navigation,
}: {
  navigation: TemplateNavigationNode[]
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { messages: allMessages } = useLocale()
  const messages = allMessages.sidebar

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    document.cookie = `theme=${next ? 'dark' : 'light'}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <aside className="flex flex-col border-b border-white/10 bg-[#10271f] text-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
      <header className="flex h-[82px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#c8f7d9] text-[#10271f]">
            <Images size={20} strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-black tracking-[-0.02em]">FrameKit</p>
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

      <div className="relative mt-auto shrink-0 border-t border-white/10 px-5 py-4">
        <p className="text-center text-[10px] text-[#91ae9f]">
          {messages.developedBy}{' '}
          <a
            href="https://mauriciodmo.com"
            className="font-bold text-[#c8f7d9] hover:underline"
            target="_blank"
          >
            MauricioDMO
          </a>
        </p>
        <div className="relative mt-3">
          {settingsOpen && (
            <div
              id="sidebar-settings"
              className="absolute bottom-[calc(100%+0.75rem)] left-0 right-0 z-20 rounded-xl border border-white/15 bg-[#173d31] p-3 shadow-xl"
            >
              <LanguageSelect />
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={messages.themeToggleLabel}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-between rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-bold text-[#c8f7d9] transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#c8f7d9]"
              >
                {messages.themeToggleLabel}
                <Sun size={16} className="dark:hidden" />
                <Moon size={16} className="hidden dark:block" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label={messages.settingsLabel}
            aria-controls="sidebar-settings"
            aria-expanded={settingsOpen}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold text-[#c8f7d9] transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#c8f7d9]"
          >
            <Settings size={17} />
            {messages.settingsLabel}
          </button>
        </div>
      </div>
    </aside>
  )
}
