'use client'

import { Images } from 'lucide-react'

import type { TemplateNavigationNode } from '@/lib/templates/types'

import { NavigationNode } from './navigation-node'

export function TemplateSidebar({
  navigation,
}: {
  navigation: TemplateNavigationNode[]
}) {
  return (
    <aside className="border-b border-white/10 bg-[#10271f] text-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
      <header className="flex h-[82px] items-center border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#c8f7d9] text-[#10271f]">
            <Images size={20} strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-black tracking-[-0.02em]">Image Studio</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[#91ae9f]">
              Taller visual
            </p>
          </div>
        </div>
      </header>

      <nav
        aria-label="Plantillas"
        className="max-h-[38vh] overflow-y-auto p-3 lg:h-[calc(100vh-82px)] lg:max-h-none"
      >
        {navigation.length === 0 ? (
          <p className="px-3 py-4 text-sm text-[#91ae9f]">
            No hay plantillas disponibles.
          </p>
        ) : (
          navigation.map((node) => (
            <NavigationNode key={node.id} node={node} level={0} />
          ))
        )}
      </nav>
    </aside>
  )
}
