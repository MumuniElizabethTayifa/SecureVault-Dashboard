import { useCallback, useEffect, useState } from 'react'
import type { RecentEntry, VaultNode } from '../types'

const STORAGE_KEY = 'securevault.recent'
const MAX_ENTRIES = 6

function load(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Wildcard feature — "Recently Viewed".
 *
 * The brief never asked for it, but a lawyer juggling dozens of nested case
 * folders will repeatedly need the *same* handful of documents in a session
 * (the draft they're editing, the exhibit they're cross-referencing). Forcing
 * them to re-walk the tree every time is exactly the friction the client
 * complained about. This hook persists the last few opened files to
 * localStorage and exposes them as one-click shortcuts, so returning to a
 * document is instant regardless of how deep it lives.
 */
export function useRecentFiles() {
  const [recent, setRecent] = useState<RecentEntry[]>(() => load())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
  }, [recent])

  const recordVisit = useCallback((node: VaultNode) => {
    if (node.type !== 'file') return
    setRecent((prev) => {
      const withoutCurrent = prev.filter((entry) => entry.id !== node.id)
      const next: RecentEntry[] = [
        { id: node.id, name: node.name, size: node.size, viewedAt: Date.now() },
        ...withoutCurrent,
      ]
      return next.slice(0, MAX_ENTRIES)
    })
  }, [])

  return { recent, recordVisit }
}
