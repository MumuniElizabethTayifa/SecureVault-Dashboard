import { SearchIcon, CloseIcon } from './icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <SearchIcon size={16} className="search-bar__icon" />
      <input
        type="search"
        className="search-bar__input"
        placeholder="Search folders and files…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search the vault by file or folder name"
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  )
}
