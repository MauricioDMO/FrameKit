'use client'

import { ChevronRight, FileImage, Folder } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import type { TemplateNavigationNode } from './navigation'

export function FrameKitNavigation({
  node,
  level = 0,
}: {
  node: TemplateNavigationNode
  level?: number
}) {
  const pathname = usePathname()

  if (node.type === 'template') {
    const selected = pathname === node.href

    return (
      <Link
        href={node.href}
        aria-current={selected ? 'page' : undefined}
        className={`mb-1 flex items-center gap-2.5 rounded-lg py-2.5 pr-3 text-sm transition ${
          selected
            ? 'bg-[#c8f7d9] font-bold text-[#10271f]'
            : 'text-[#bed0c6] hover:bg-white/8 hover:text-white'
        }`}
        style={{ paddingLeft: 12 + level * 15 }}
      >
        <FileImage size={16} className="shrink-0" />
        <span className="truncate">{node.title}</span>
      </Link>
    )
  }

  return <NavigationFolder node={node} level={level} />
}

function NavigationFolder({
  node,
  level,
}: {
  node: Extract<TemplateNavigationNode, { type: 'folder' }>
  level: number
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 rounded-lg py-2.5 pr-3 text-left text-sm font-semibold text-[#d7e2dc] transition hover:bg-white/8"
        style={{ paddingLeft: 12 + level * 15 }}
      >
        <ChevronRight
          size={15}
          className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <Folder size={16} className="shrink-0 text-[#86a998]" />
        <span className="truncate">{node.title}</span>
      </button>

      {open && (
        <div>
          {node.children.map((child) => (
            <FrameKitNavigation key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
