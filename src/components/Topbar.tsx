import { ShieldIcon } from './icons'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__logo">
          <ShieldIcon size={20} />
        </span>
        <span className="topbar__title">Secure Vault</span>
      </div>
      <div className="topbar__user">
        <span className="topbar__user-name">Liam Hue</span>
        <span className="topbar__user-role">Lawyer</span>
        <span className="topbar__avatar" aria-hidden="true">LH</span>
      </div>
    </header>
  )
}
