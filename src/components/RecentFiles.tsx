import type { RecentEntry } from '../types'
import { FileIcon, ClockIcon } from './icons'

interface RecentFilesProps {
  items: RecentEntry[]
  activeId: string | null
  onSelect: (id: string) => void
}

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export default function RecentFiles({ items, activeId, onSelect }: RecentFilesProps) {
  if (items.length === 0) {
    return (
      <section className="recent recent--empty" aria-label="Recently viewed files">
        <h2 className="recent__title"><ClockIcon size={16} /> Recent</h2>
        <p className="recent__hint">Files you open will show up here for quick access.</p>
      </section>
    )
  }

  return (
    <section className="recent" aria-label="Recently viewed files">
      <h2 className="recent__title"><ClockIcon size={16} /> Recent</h2>
      <ul className="recent__list">
        {items.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className={`recent__card${activeId === entry.id ? ' is-active' : ''}`}
              onClick={() => onSelect(entry.id)}
            >
              <span className="recent__card-icon"><FileIcon size={16} /></span>
              <span className="recent__card-name" title={entry.name}>{entry.name}</span>
              <span className="recent__card-time">{timeAgo(entry.viewedAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
