import type { VaultNode } from '../types'
import { getFileType } from '../utils/file'
import { FileIcon, ShieldIcon } from './icons'

interface PropertiesPanelProps {
  node: VaultNode | null
  path: VaultNode[] | null
}

export default function PropertiesPanel({ node, path }: PropertiesPanelProps) {
  if (!node) {
    return (
      <aside className="properties properties--empty" aria-live="polite">
        <ShieldIcon size={28} />
        <p>Select a file to inspect its properties.</p>
        <p className="properties__hint">Use ↑ ↓ to browse, Enter to select.</p>
      </aside>
    )
  }

  const folderPath = path ? path.slice(0, -1).map((n) => n.name) : []

  return (
    <aside className="properties" aria-live="polite">
      <div className="properties__header">
        <span className="properties__icon"><FileIcon size={20} /></span>
        <div>
          <p className="properties__name" title={node.name}>{node.name}</p>
          <p className="properties__type">{getFileType(node)} document</p>
        </div>
      </div>

      <dl className="properties__list">
        <div className="properties__row">
          <dt>File name</dt>
          <dd>{node.name}</dd>
        </div>
        <div className="properties__row">
          <dt>Type</dt>
          <dd>{getFileType(node)}</dd>
        </div>
        <div className="properties__row">
          <dt>Size</dt>
          <dd>{node.size ?? 'Unknown'}</dd>
        </div>
        <div className="properties__row">
          <dt>Location</dt>
          <dd className="properties__path">
            {folderPath.length > 0 ? folderPath.join(' / ') : 'Vault root'}
          </dd>
        </div>
      </dl>

      <div className="properties__security">
        <p className="properties__security-title">Security</p>
        <div className="properties__row">
          <dt>Encryption</dt>
          <dd>AES-256 GCM</dd>
        </div>
        <div className="properties__row">
          <dt>Access</dt>
          <dd>Restricted · Audit logged</dd>
        </div>
      </div>

      <div className="properties__actions">
        <button type="button" className="btn btn--primary">Open</button>
        <button type="button" className="btn btn--ghost">Download</button>
      </div>
    </aside>
  )
}
