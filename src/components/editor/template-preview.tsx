'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

interface TemplatePreviewProps {
  width: number
  height: number
  children: ReactNode
}

export function TemplatePreview({
  width,
  height,
  children,
}: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      const horizontalSpace = container.clientWidth - 48
      const verticalSpace = container.clientHeight - 48
      const nextScale = Math.min(
        horizontalSpace / width,
        verticalSpace / height,
        1,
      )

      setScale(Math.max(nextScale, 0.1))
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [width, height])

  return (
    <section
      ref={containerRef}
      aria-label="Vista previa"
      className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#d9d7cf] p-6 shadow-inner"
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(#4f5e56_0.7px,transparent_0.7px)] [background-size:16px_16px]" />
      <div
        className="relative shadow-[0_24px_60px_rgba(25,35,30,0.24)]"
        style={{ width: width * scale, height: height * scale }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
