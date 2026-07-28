'use client'

import { ChevronRight, FileImage, Folder } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useState } from 'react'

import type { TemplateNavigationNode } from './navigation'

const navigationStorageKey = 'framekit:navigation:v1'
const useNavigationEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
type NavigationState = Record<string, boolean>

export function FrameKitNavigation({
  node,
  level = 0,
}: {
  node: TemplateNavigationNode
  level?: number
}) {
  return <FrameKitNavigationTree nodes={[node]} level={level} />
}

export function FrameKitNavigationTree({
  nodes,
  level = 0,
}: {
  nodes: readonly TemplateNavigationNode[]
  level?: number
}) {
  const pathname = usePathname()
  const [expandedById, setExpandedById] = useState<NavigationState | null>(null)

  useNavigationEffect(() => {
    setExpandedById(readNavigationState())
  }, [])

  function toggleFolder(id: string) {
    setExpandedById((current) => {
      if (!current) return current

      const next = { ...current, [id]: !(current[id] ?? true) }
      persistNavigationState(next)
      return next
    })
  }

  if (!expandedById) return null

  return (
    <>
      {nodes.map((node) => (
        <NavigationNode
          key={node.id}
          node={node}
          level={level}
          pathname={pathname}
          expandedById={expandedById}
          onToggleFolder={toggleFolder}
        />
      ))}
    </>
  )
}

function readNavigationState(): NavigationState {
  try {
    const stored = localStorage.getItem(navigationStorageKey)
    if (!stored) return {}

    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === 'boolean')) as NavigationState
  } catch {
    // Stored navigation state is optional and untrusted.
    return {}
  }
}

function persistNavigationState(state: NavigationState) {
  try {
    localStorage.setItem(navigationStorageKey, JSON.stringify(state))
  } catch {
    // Navigation must continue working when storage is unavailable.
  }
}

function NavigationNode({
  node,
  level,
  pathname,
  expandedById,
  onToggleFolder,
}: {
  node: TemplateNavigationNode
  level: number
  pathname: string
  expandedById: NavigationState
  onToggleFolder: (id: string) => void
}) {

  if (node.type === 'template') {
    const selected = pathname === node.href

    return (
      <Link
        href={node.href}
        aria-current={selected ? 'page' : undefined}
        className={`relative mb-1 flex items-center gap-2.5 rounded-lg py-2.5 pr-3 text-sm transition ${
          selected
            ? 'bg-[#c8f7d9] font-bold text-[#10271f]'
            : 'text-[#bed0c6] hover:bg-white/8 hover:text-white'
        }`}
        style={{ paddingLeft: 12 + level * 15 }}
      >
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 w-0.5 rounded-full bg-[#86a998]/45"
          style={{ left: 5 + level * 15 }}
        />
        <FileImage size={16} className="shrink-0" />
        <span className="truncate">{node.title}</span>
      </Link>
    )
  }

  return <NavigationFolder node={node} level={level} open={expandedById[node.id] ?? true} onToggle={() => onToggleFolder(node.id)} pathname={pathname} expandedById={expandedById} onToggleFolder={onToggleFolder} />
}

function NavigationFolder({
  node,
  level,
  open,
  onToggle,
  pathname,
  expandedById,
  onToggleFolder,
}: {
  node: Extract<TemplateNavigationNode, { type: 'folder' }>
  level: number
  open: boolean
  onToggle: () => void
  pathname: string
  expandedById: NavigationState
  onToggleFolder: (id: string) => void
}) {

  return (
    <div className="mb-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
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
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-1 w-px bg-[#86a998]/25"
            style={{ left: 5 + level * 15 }}
          />
          {node.children.map((child) => (
            <NavigationNode
              key={child.id}
              node={child}
              level={level + 1}
              pathname={pathname}
              expandedById={expandedById}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}
