import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Home,
  ShieldCheck,
  Search,
  Clock,
  X,
  type LucideIcon,
} from 'lucide-react'

type IconProps = { size?: number; className?: string }

function wrap(Icon: LucideIcon, strokeWidth = 1.8) {
  return function WrappedIcon({ size = 16, className }: IconProps) {
    return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />
  }
}

export const ChevronIcon = wrap(ChevronRight)
export const FolderIcon = wrap(Folder)
export const FolderOpenIcon = wrap(FolderOpen)
export const FileIcon = wrap(FileText)
export const HomeIcon = wrap(Home)
export const VaultIcon = wrap(ShieldCheck)
export const SearchIcon = wrap(Search)
export const ClockIcon = wrap(Clock)
export const ShieldIcon = wrap(ShieldCheck)
export const CloseIcon = wrap(X)
