'use client'

import { IconChevronRight, IconFolder, IconPhoto } from '@tabler/icons-react'
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
        className={`mb-0.5 flex items-center gap-1 rounded-lg py-1.5 pr-3 text-sm transition focus:ring-2 focus:ring-inset focus:ring-[#c8f7d9] focus:outline-none ${
          selected
            ? 'bg-white/10 font-bold text-[#f5f7ee]'
            : 'text-[#bed0c6] hover:bg-white/8 hover:text-white'
        }`}
        style={{ paddingLeft: 17 + level * 12 }}
      >
        <IconPhoto size={16} className="shrink-0" />
        <span className="truncate">{node.title}</span>
      </Link>
    )
  }

  const open = expandedById[node.id] ?? true
  return <NavigationFolder node={node} level={level} open={open || containsSelectedTemplate(node, pathname)} onToggle={() => onToggleFolder(node.id)} pathname={pathname} expandedById={expandedById} onToggleFolder={onToggleFolder} />
}

function containsSelectedTemplate(node: Extract<TemplateNavigationNode, { type: 'folder' }>, pathname: string): boolean {
  return node.children.some((child) => child.type === 'template' ? child.href === pathname : containsSelectedTemplate(child, pathname))
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
    <div className="mb-0.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-1 rounded-lg py-1.5 pr-3 text-left text-sm font-semibold text-[#d7e2dc] transition hover:bg-white/8 focus:ring-2 focus:ring-inset focus:ring-[#c8f7d9] focus:outline-none"
        style={{ paddingLeft: 10 + level * 12 }}
      >
        <IconChevronRight
          size={15}
          className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <IconFolder size={16} className="shrink-0 text-[#86a998]" />
        <span className="truncate">{node.title}</span>
      </button>

      {open && (
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-1 w-px bg-[#86a998]/25"
            style={{ left: 17 + level * 12 }}
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
