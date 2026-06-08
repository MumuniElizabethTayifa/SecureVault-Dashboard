import { useMemo, useState } from 'react'
import vaultData from './data.json'
import type { VaultNode } from './types'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import SearchBar from './components/SearchBar'
import FolderTree from './components/FolderTree'
import PropertiesPanel from './components/PropertiesPanel'
import RecentFiles from './components/RecentFiles'
import { useRecentFiles } from './hooks/useRecentFiles'
import { countFiles, countNodes, findPath } from './utils/file'
import { collectMatchingFolderIds } from './utils/tree'
import './App.css'

const data = vaultData as VaultNode[]

function App() {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['root_1', 'leg_1']))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const { recent, recordVisit } = useRecentFiles()

  const totalItems = useMemo(() => countNodes(data), [])
  const totalFiles = useMemo(() => countFiles(data), [])

  const selectedPath = useMemo(
    () => (selectedId ? findPath(data, selectedId) : null),
    [selectedId],
  )
  const selectedNode = selectedPath ? selectedPath[selectedPath.length - 1] : null

  function toggleFolder(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectNode(node: VaultNode) {
    setSelectedId(node.id)
    recordVisit(node)
  }

  function selectById(id: string) {
    const path = findPath(data, id)
    const node = path?.[path.length - 1]
    if (node) selectNode(node)
    // Make sure the file's ancestor folders are expanded so it's visible in the tree.
    if (path) {
      setExpanded((prev) => {
        const next = new Set(prev)
        path.slice(0, -1).forEach((ancestor) => next.add(ancestor.id))
        return next
      })
    }
  }

  function handleSearchChange(next: string) {
    setQuery(next)
    if (next.trim()) {
      const matchingFolders = collectMatchingFolderIds(data, next)
      setExpanded((prev) => new Set([...prev, ...matchingFolders]))
    }
  }

  return (
    <div className="app">
      <Topbar />
      <div className="app__body">
        <Sidebar totalItems={totalItems} totalFiles={totalFiles} />

        <main className="explorer">
          <div className="explorer__head">
            <div>
              <h1 className="explorer__title">File Explorer</h1>
              <span className="explorer__badge">{totalItems} items</span>
            </div>
            <SearchBar value={query} onChange={handleSearchChange} />
          </div>

          <RecentFiles items={recent} activeId={selectedId} onSelect={selectById} />

          <div className="explorer__tree-card">
            <div className="tree-header" role="presentation">
              <span className="tree-header__name">Name</span>
              <span className="tree-header__meta">Type</span>
              <span className="tree-header__size">Size</span>
            </div>
            <FolderTree
              data={data}
              expanded={expanded}
              onToggle={toggleFolder}
              selectedId={selectedId}
              onSelect={selectNode}
              query={query}
            />
          </div>
        </main>

        <PropertiesPanel node={selectedNode} path={selectedPath} />
      </div>
    </div>
  )
}

export default App
