import type { VaultNode } from '../types'
import { nodeMatchesQuery } from './file'

export interface FlatRow {
  node: VaultNode
  depth: number
  parentId: string | null
}

/**
 * Flattens the tree into the list of currently *visible* rows: a folder's
 * children only appear when that folder's id is present in `expanded`.
 * This single source of truth drives both rendering order and keyboard
 * navigation (Up/Down simply move across this array).
 */
export function flattenVisible(
  nodes: VaultNode[],
  expanded: Set<string>,
  depth = 0,
  parentId: string | null = null,
  query = '',
): FlatRow[] {
  const rows: FlatRow[] = []
  for (const node of nodes) {
    if (query && !nodeMatchesQuery(node, query)) continue
    rows.push({ node, depth, parentId })
    if (node.type === 'folder' && node.children && node.children.length > 0) {
      const isForceOpen = Boolean(query) && nodeMatchesQuery(node, query)
      if (expanded.has(node.id) || isForceOpen) {
        rows.push(...flattenVisible(node.children, expanded, depth + 1, node.id, query))
      }
    }
  }
  return rows
}

/** Collects the ids of every folder that contains a node matching the query (so they can be auto-expanded). */
export function collectMatchingFolderIds(nodes: VaultNode[], query: string, acc: Set<string> = new Set()): Set<string> {
  const q = query.trim().toLowerCase()
  if (!q) return acc
  for (const node of nodes) {
    if (node.type === 'folder' && node.children) {
      const childMatches = node.children.some((child) => nodeMatchesQuery(child, q))
      if (childMatches || node.name.toLowerCase().includes(q)) {
        acc.add(node.id)
      }
      collectMatchingFolderIds(node.children, query, acc)
    }
  }
  return acc
}
