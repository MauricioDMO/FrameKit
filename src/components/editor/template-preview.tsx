'use client'

import { Maximize2, Minimize2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface TemplatePreviewProps {
  width: number
  height: number
  label: string
  actualSizeLabel: string
  fitToViewLabel: string
  children: ReactNode
}

interface View {
  scale: number
  x: number
  y: number
}

const MIN_SCALE = 0.1
const MAX_SCALE = 4

function getFittedView(container: HTMLDivElement, width: number, height: number): View {
  const horizontalSpace = container.clientWidth - 48
  const verticalSpace = container.clientHeight - 48
  const scale = Math.max(
    Math.min(horizontalSpace / width, verticalSpace / height, 1),
    MIN_SCALE,
  )

  return {
    scale,
    x: (container.clientWidth - width * scale) / 2,
    y: (container.clientHeight - height * scale) / 2,
  }
}

export function TemplatePreview({
  width,
  height,
  label,
  actualSizeLabel,
  fitToViewLabel,
  children,
}: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    x: number
    y: number
    view: View
  } | null>(null)
  const [view, setView] = useState<View>({ scale: 0.5, x: 0, y: 0 })
  const [viewReady, setViewReady] = useState(false)
  const [viewMode, setViewMode] = useState<'fit' | 'actual' | 'custom'>('fit')
  const [dragging, setDragging] = useState(false)

  function fitToView() {
    const container = containerRef.current
    if (container) setView(getFittedView(container, width, height))
    setViewMode('fit')
  }

  function showActualSize() {
    const container = containerRef.current
    if (!container) return

    setView({
      scale: 1,
      x: (container.clientWidth - width) / 2,
      y: (container.clientHeight - height) / 2,
    })
    setViewMode('actual')
  }

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    setView(getFittedView(container, width, height))
    setViewReady(true)

    const observer = new ResizeObserver(() => {
      if (viewMode !== 'fit') return
      setView(getFittedView(container, width, height))
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [width, height, viewMode])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const previewStage = stage

    function zoomAtPointer(event: WheelEvent) {
      if (!event.ctrlKey) return

      event.preventDefault()
      const bounds = previewStage.getBoundingClientRect()
      const pointerX = event.clientX - bounds.left
      const pointerY = event.clientY - bounds.top

      setView((current) => {
        const scale = Math.min(
          Math.max(current.scale * Math.exp(-event.deltaY * 0.002), MIN_SCALE),
          MAX_SCALE,
        )

        return {
          scale,
          x: pointerX - ((pointerX - current.x) / current.scale) * scale,
          y: pointerY - ((pointerY - current.y) / current.scale) * scale,
        }
      })
      setViewMode('custom')
    }

    previewStage.addEventListener('wheel', zoomAtPointer, { passive: false })
    return () => previewStage.removeEventListener('wheel', zoomAtPointer)
  }, [])

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      view,
    }
    setViewMode('custom')
    setDragging(true)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    setView({
      ...drag.view,
      x: drag.view.x + event.clientX - drag.x,
      y: drag.view.y + event.clientY - drag.y,
    })
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return

    dragRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <section
      ref={containerRef}
      aria-label={label}
      className="relative flex min-h-130 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#d9d7cf] p-6 shadow-inner dark:border-white/10 dark:bg-[#2a3931]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#4f5e56_0.7px,transparent_0.7px)] bg-size-[16px_16px] opacity-30 dark:opacity-50" />
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`absolute inset-0 touch-none select-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          className="absolute top-0 left-0 shadow-[0_24px_60px_rgba(25,35,30,0.24)]"
          style={{
            width,
            height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: 'top left',
            visibility: viewReady ? 'visible' : 'hidden',
          }}
        >
          {children}
        </div>
      </div>
      <div className="absolute right-4 bottom-4 z-10 flex overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#24342c]">
        <button
          type="button"
          onClick={showActualSize}
          aria-label={actualSizeLabel}
          aria-pressed={viewMode === 'actual'}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition ${
            viewMode === 'actual'
              ? 'bg-[#173d31] text-white'
              : 'text-[#4e5a53] hover:bg-[#efeee9] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]'
          }`}
        >
          <Maximize2 size={14} />
          100%
        </button>
        <button
          type="button"
          onClick={fitToView}
          aria-label={fitToViewLabel}
          aria-pressed={viewMode === 'fit'}
          className={`inline-flex items-center gap-1.5 border-l border-black/10 px-3 py-2 text-xs font-bold transition ${
            viewMode === 'fit'
              ? 'bg-[#173d31] text-white'
              : 'text-[#4e5a53] hover:bg-[#efeee9] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]'
          }`}
        >
          <Minimize2 size={14} />
          {fitToViewLabel}
        </button>
      </div>
    </section>
  )
}
