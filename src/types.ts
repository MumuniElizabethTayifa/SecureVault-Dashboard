export type NodeType = 'folder' | 'file'

export interface VaultNode {
  id: string
  name: string
  type: NodeType
  size?: string
  children?: VaultNode[]
}

export interface RecentEntry {
  id: string
  name: string
  size?: string
  viewedAt: number
}
