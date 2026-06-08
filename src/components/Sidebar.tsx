import { HomeIcon, VaultIcon } from './icons'

interface SidebarProps {
  totalItems: number
  totalFiles: number
}

export default function Sidebar({ totalItems, totalFiles }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Primary">
      <a className="sidebar__link" href="#" aria-current="false">
        <HomeIcon size={18} />
        <span>Home</span>
      </a>
      <a className="sidebar__link is-active" href="#" aria-current="page">
        <VaultIcon size={18} />
        <span>Files</span>
      </a>

      <div className="sidebar__stats">
        <div className="sidebar__stat">
          <span className="sidebar__stat-value">{totalItems}</span>
          <span className="sidebar__stat-label">Total items</span>
        </div>
        <div className="sidebar__stat">
          <span className="sidebar__stat-value">{totalFiles}</span>
          <span className="sidebar__stat-label">Files</span>
        </div>
      </div>
    </nav>
  )
}
