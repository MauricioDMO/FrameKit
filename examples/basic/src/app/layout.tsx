import type { Metadata } from 'next'
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'
import { frameKitMessages } from '@mauriciodmo/framekit/studio'

import './globals.css'

export const metadata: Metadata = frameKitMessages.es.metadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <FrameKitStudioRoot>{children}</FrameKitStudioRoot>
}
