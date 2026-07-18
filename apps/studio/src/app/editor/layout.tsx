import type { ReactNode } from 'react'

import { TemplateSidebar } from '@/components/navigation/template-sidebar'
import { templateManifest } from '@/.framekit/manifest'
import { manifestToNavigation } from '@mauriciodmo/framekit/editor'

export const runtime = 'nodejs'

export default async function EditorLayout({
  children,
}: {
  children: ReactNode
}) {
  const navigation = manifestToNavigation(templateManifest)

  return (
    <div className="min-h-screen bg-[#f0eee7] lg:grid lg:grid-cols-[296px_1fr] xl:h-dvh xl:min-h-0 xl:overflow-hidden dark:bg-[#17221d]">
      <TemplateSidebar navigation={navigation} />
      <main className="min-w-0 xl:min-h-0 xl:overflow-hidden">{children}</main>
    </div>
  )
}
