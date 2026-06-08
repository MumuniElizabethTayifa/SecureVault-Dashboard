# SecureVault — File Explorer Dashboard

A dark-mode, "cyber-secure" file explorer built for SecureVault Inc.'s enterprise cloud storage clients. It renders deeply nested folder structures from a JSON feed, supports full keyboard navigation, and surfaces file metadata in a dedicated properties panel.

## 1. Setup

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# type-check and build for production
npm run build

# preview the production build
npm run preview
```

The app reads its data from `src/data.json` (a copy of the provided `data.json`, unmodified in structure).

## 2. Design File

Figma — Design System & Application frames:
https://www.figma.com/design/wRXeUwwdYdjqrklCmG9dye/Mumuni?node-id=12-7207

The file contains a **System Design** page (typography scale, color palette, spacing grid, component states) and a **Design** page with the application frames (file explorer, folder tree, properties modal). The implementation follows that dark navy / cyan "precise and fast" aesthetic, expressed here as CSS custom properties in `src/index.css`.

## 3. Recursive Strategy

The folder tree is driven by one idea: **render exactly what's visible, and keep that list as the single source of truth for both rendering and navigation.**

- `src/components/FolderTree.tsx` recurses through `VaultNode.children`. Each folder is just a row with an `id`; whether its children are rendered depends only on whether that `id` is present in an `expanded: Set<string>` held by `App`. This means the component's shape never changes with depth — two levels or twenty levels are handled identically, and state for expansion, selection, and search lives in one place so every level stays in sync.
- For keyboard navigation, re-walking the tree on every arrow-key press would be wasteful and error-prone. Instead, `src/utils/tree.ts#flattenVisible` walks the tree once per render and produces a flat, ordered array of the rows currently on screen (a collapsed folder simply contributes no rows for its children). Arrow-key handling in `FolderTree` then becomes index arithmetic over that array — `Up`/`Down` move the index, `Right` expands or steps into the first child, `Left` collapses or steps to the parent, `Enter`/`Space` activates the focused row. This keeps focus movement O(1) per keystroke and easy to reason about.
- `findPath` (in `src/utils/file.ts`) does a similar single-pass recursive walk to build a breadcrumb/ancestor chain for the properties panel, and to make sure a file's parent folders auto-expand when it's opened from search or the Recent list.

## 4. Wildcard Feature — "Recently Viewed"

**The gap:** the brief asks for a deep, nested file explorer for people (lawyers, bank staff) who repeatedly need the *same* handful of documents within a session — the draft they're editing, the exhibit they keep cross-referencing. Nothing in the requirements addresses that, and re-walking ten levels of folders every time is exactly the kind of friction the client originally complained about ("hard to navigate").

**What it does:** every file a user opens is recorded (`src/hooks/useRecentFiles.ts`) and persisted to `localStorage`. The most recent entries appear as one-click cards at the top of the explorer (`src/components/RecentFiles.tsx`), each showing the file name and a relative timestamp ("2h ago"). Clicking a card selects the file, expands its ancestor folders, and opens its properties — instantly, regardless of how deep it lives.

**Why it adds business value:** it directly targets the stated pain point (navigating nested files quickly) without adding any new screens or backend requirements — it's a thin, persistent layer over data the app already has. For a law firm or bank, shaving seconds off "find the file I was just in" compounds across hundreds of daily lookups, and a tool that *remembers where you left off* reads as more "precise and fast," reinforcing the brand goal in the design brief.

## 5. Other Notable Behaviour

- **Search & filter (bonus):** the search bar (`src/components/SearchBar.tsx`) filters the tree by name; any folder containing a match auto-expands (`collectMatchingFolderIds` in `src/utils/tree.ts`) and the matching substring is highlighted inline.
- **Keyboard accessibility:** the tree exposes proper `role="tree"` / `role="treeitem"` semantics with `aria-level`, `aria-expanded`, and `aria-selected`, and supports `Up/Down/Left/Right/Enter/Space/Home/End`.
- **Properties panel:** selecting a file shows its name, type, size, full folder path, and read-only security metadata, matching the "Properties" frame in the Figma file.

## 6. Tech Stack

React + TypeScript + Vite, styled with hand-written CSS (custom properties for the design tokens — no UI component libraries). Icons come from [`lucide-react`](https://lucide.dev), wrapped in `src/components/icons.tsx` so every call site keeps the same `size`/`className` API regardless of the underlying icon set.
