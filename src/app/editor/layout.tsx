import type { ReactNode } from 'react'

import { TemplateSidebar } from '@/components/navigation/template-sidebar'
import { readTemplateCatalog } from '@/lib/templates/read-template-catalog'

export const runtime = 'nodejs'

export default async function EditorLayout({
  children,
}: {
  children: ReactNode
}) {
  const navigation = await readTemplateCatalog()

  return (
    <div className="min-h-screen bg-[#f0eee7] lg:grid lg:grid-cols-[296px_1fr]">
      <TemplateSidebar navigation={navigation} />
      <main className="min-w-0">{children}</main>
    </div>
  )
}
