import type { VaultNode } from '../types'

/** Returns the file extension in upper case, e.g. "PDF", "DOCX". Folders return "Folder". */
export function getFileType(node: VaultNode): string {
  if (node.type === 'folder') return 'Folder'
  const parts = node.name.split('.')
  if (parts.length < 2) return 'File'
  return parts[parts.length - 1].toUpperCase()
}

/** Maps a file extension to a short category used for icon coloring. */
export function getFileCategory(node: VaultNode): string {
  const ext = getFileType(node).toLowerCase()
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) return 'doc'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet'
  if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext)) return 'image'
  if (['yaml', 'yml', 'json', 'ts', 'js', 'tsx', 'jsx', 'ttf'].includes(ext)) return 'code'
  return 'generic'
}

/** Parses a human size string like "4.2MB" into bytes for sorting/comparison. */
export function parseSizeToBytes(size?: string): number {
  if (!size) return 0
  const match = size.trim().match(/^([\d.]+)\s*(KB|MB|GB|B)$/i)
  if (!match) return 0
  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  const multiplier = unit === 'GB' ? 1024 ** 3 : unit === 'MB' ? 1024 ** 2 : unit === 'KB' ? 1024 : 1
  return value * multiplier
}

/** Recursively counts every node (files + folders) within a tree. */
export function countNodes(nodes: VaultNode[]): number {
  let total = 0
  for (const node of nodes) {
    total += 1
    if (node.children) total += countNodes(node.children)
  }
  return total
}

/** Recursively counts only files within a tree. */
export function countFiles(nodes: VaultNode[]): number {
  let total = 0
  for (const node of nodes) {
    if (node.type === 'file') total += 1
    if (node.children) total += countFiles(node.children)
  }
  return total
}

/** Builds the breadcrumb path (array of names) leading to a target node id. */
export function findPath(nodes: VaultNode[], targetId: string, trail: VaultNode[] = []): VaultNode[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node]
    if (node.id === targetId) return nextTrail
    if (node.children) {
      const found = findPath(node.children, targetId, nextTrail)
      if (found) return found
    }
  }
  return null
}

/** Returns true if any descendant (or the node itself) matches the search query by name. */
export function nodeMatchesQuery(node: VaultNode, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (node.name.toLowerCase().includes(q)) return true
  if (node.children) return node.children.some((child) => nodeMatchesQuery(child, q))
  return false
}
