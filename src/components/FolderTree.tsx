import { useEffect, useMemo, useRef } from 'react'
import type { VaultNode } from '../types'
import { flattenVisible, collectMatchingFolderIds, type FlatRow } from '../utils/tree'
import { getFileType } from '../utils/file'
import { ChevronIcon, FolderIcon, FolderOpenIcon, FileIcon } from './icons'

interface FolderTreeProps {
  data: VaultNode[]
  expanded: Set<string>
  onToggle: (id: string) => void
  selectedId: string | null
  onSelect: (node: VaultNode) => void
  query: string
}

/**
 * Recursive Strategy
 * ------------------
 * The JSON tree is rendered by recursing through `VaultNode.children`: each
 * folder renders its own row, then — if expanded — maps over its children and
 * renders a `FolderTree` for each, passing the same handlers down. This keeps
 * the component shape independent of depth (2 levels or 20 levels render the
 * same way) and keeps state (expansion, selection, search) lifted to a single
 * owner so every level stays in sync.
 *
 * For keyboard navigation we additionally flatten the *visible* rows (a
 * folder's children only count when expanded) into one ordered array. Arrow
 * keys then become simple index math over that array rather than tree
 * traversal, which keeps focus movement predictable and O(1) per keystroke.
 */
export default function FolderTree({ data, expanded, onToggle, selectedId, onSelect, query }: FolderTreeProps) {
  const visibleRows = useMemo(() => flattenVisible(data, expanded, 0, null, query), [data, expanded, query])
  const matchingFolders = useMemo(() => collectMatchingFolderIds(data, query), [data, query])
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const focusedIdRef = useRef<string | null>(null)

  // Keep a focused row id; default to the first visible row.
  if (!focusedIdRef.current && visibleRows.length > 0) {
    focusedIdRef.current = visibleRows[0].node.id
  }
  const focusedId = focusedIdRef.current

  useEffect(() => {
    if (focusedId) {
      itemRefs.current.get(focusedId)?.focus()
    }
  }, [focusedId])

  function setFocused(id: string) {
    focusedIdRef.current = id
    itemRefs.current.get(id)?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = visibleRows.findIndex((r) => r.node.id === focusedId)
    if (idx === -1) return

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const next = visibleRows[Math.min(idx + 1, visibleRows.length - 1)]
        if (next) setFocused(next.node.id)
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prev = visibleRows[Math.max(idx - 1, 0)]
        if (prev) setFocused(prev.node.id)
        break
      }
      case 'ArrowRight': {
        e.preventDefault()
        const row = visibleRows[idx]
        if (row.node.type === 'folder') {
          if (!expanded.has(row.node.id) && (row.node.children?.length ?? 0) > 0) {
            onToggle(row.node.id)
          } else {
            const next = visibleRows[idx + 1]
            if (next && next.parentId === row.node.id) setFocused(next.node.id)
          }
        }
        break
      }
      case 'ArrowLeft': {
        e.preventDefault()
        const row = visibleRows[idx]
        if (row.node.type === 'folder' && expanded.has(row.node.id)) {
          onToggle(row.node.id)
        } else if (row.parentId) {
          setFocused(row.parentId)
        }
        break
      }
      case 'Enter':
      case ' ': {
        e.preventDefault()
        const row = visibleRows[idx]
        if (row.node.type === 'file') {
          onSelect(row.node)
        } else {
          onToggle(row.node.id)
        }
        break
      }
      case 'Home': {
        e.preventDefault()
        if (visibleRows[0]) setFocused(visibleRows[0].node.id)
        break
      }
      case 'End': {
        e.preventDefault()
        const last = visibleRows[visibleRows.length - 1]
        if (last) setFocused(last.node.id)
        break
      }
    }
  }

  return (
    <div
      className="tree"
      role="tree"
      aria-label="Vault file explorer"
      onKeyDown={handleKeyDown}
    >
      {visibleRows.map((row) => (
        <TreeRow
          key={row.node.id}
          row={row}
          isExpanded={expanded.has(row.node.id) || (Boolean(query) && matchingFolders.has(row.node.id))}
          isSelected={selectedId === row.node.id}
          isFocused={focusedId === row.node.id}
          query={query}
          registerRef={(el) => {
            if (el) itemRefs.current.set(row.node.id, el)
            else itemRefs.current.delete(row.node.id)
          }}
          onActivate={() => {
            focusedIdRef.current = row.node.id
            if (row.node.type === 'file') onSelect(row.node)
            else onToggle(row.node.id)
          }}
        />
      ))}
      {visibleRows.length === 0 && (
        <p className="tree-empty">No items match your search.</p>
      )}
    </div>
  )
}

function TreeRow({
  row,
  isExpanded,
  isSelected,
  isFocused,
  query,
  registerRef,
  onActivate,
}: {
  row: FlatRow
  isExpanded: boolean
  isSelected: boolean
  isFocused: boolean
  query: string
  registerRef: (el: HTMLDivElement | null) => void
  onActivate: () => void
}) {
  const { node, depth } = row
  const isFolder = node.type === 'folder'
  const hasChildren = isFolder && (node.children?.length ?? 0) > 0

  return (
    <div
      ref={registerRef}
      role="treeitem"
      aria-level={depth + 1}
      aria-selected={isSelected}
      aria-expanded={isFolder ? isExpanded : undefined}
      tabIndex={isFocused ? 0 : -1}
      className={[
        'tree-row',
        isFolder ? 'tree-row--folder' : 'tree-row--file',
        isSelected ? 'is-selected' : '',
      ].join(' ').trim()}
      style={{ paddingLeft: `${12 + depth * 20}px` }}
      onClick={onActivate}
      onFocus={() => {}}
    >
      <span className="tree-row__chevron">
        {hasChildren ? (
          <ChevronIcon size={14} className={isExpanded ? 'chevron is-open' : 'chevron'} />
        ) : (
          <span className="tree-row__chevron-spacer" />
        )}
      </span>
      <span className="tree-row__icon" data-kind={isFolder ? 'folder' : 'file'}>
        {isFolder ? (
          isExpanded ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} />
        ) : (
          <FileIcon size={16} />
        )}
      </span>
      <span className="tree-row__name">{highlightMatch(node.name, query)}</span>
      <span className="tree-row__meta">{isFolder ? `${node.children?.length ?? 0} item${node.children?.length === 1 ? '' : 's'}` : getFileType(node)}</span>
      <span className="tree-row__size">{node.size ?? '—'}</span>
    </div>
  )
}

function highlightMatch(name: string, query: string) {
  const q = query.trim()
  if (!q) return name
  const idx = name.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return name
  return (
    <>
      {name.slice(0, idx)}
      <mark>{name.slice(idx, idx + q.length)}</mark>
      {name.slice(idx + q.length)}
    </>
  )
}
