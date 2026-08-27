'use client';

import * as React from 'react';
import { ChevronRightIcon, FolderIcon, FolderOpenIcon, FileIcon } from 'lucide-react';
import { cn } from '../utils';

export interface FileTreeItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeItem[];
  icon?: React.ComponentType<{ className?: string }>;
  meta?: Record<string, unknown>;
}
export interface FileTreeProps {
  items: FileTreeItem[];
  selectedId?: string;
  onSelect: (item: FileTreeItem) => void;
  onContextMenu?: (item: FileTreeItem, e: React.MouseEvent) => void;
  className?: string;
}

function handleArrowDown(opts: {
  currentIndex: number;
  visibleItems: VisibleEntry[];
  setFocusedId: (id: string | undefined) => void;
  e: React.KeyboardEvent;
}) {
  opts.e.preventDefault();
  const nextIndex = Math.min(opts.currentIndex + 1, opts.visibleItems.length - 1);
  opts.setFocusedId(opts.visibleItems[nextIndex]?.item.id);
}
function handleArrowUp(opts: {
  currentIndex: number;
  visibleItems: VisibleEntry[];
  setFocusedId: (id: string | undefined) => void;
  e: React.KeyboardEvent;
}) {
  opts.e.preventDefault();
  const prevIndex = Math.max(opts.currentIndex - 1, 0);
  opts.setFocusedId(opts.visibleItems[prevIndex]?.item.id);
}
function handleArrowRight(opts: {
  currentIndex: number;
  visibleItems: VisibleEntry[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  setFocusedId: (id: string | undefined) => void;
  e: React.KeyboardEvent;
}) {
  opts.e.preventDefault();
  const current = opts.visibleItems[opts.currentIndex];
  if (current?.item.type !== 'directory') return;
  if (!opts.expandedIds.has(current.item.id)) opts.toggleExpand(current.item.id);
  else if (current.item.children?.length) {
    const nextIndex = Math.min(opts.currentIndex + 1, opts.visibleItems.length - 1);
    opts.setFocusedId(opts.visibleItems[nextIndex]?.item.id);
  }
}
function handleArrowLeft(opts: {
  currentIndex: number;
  visibleItems: VisibleEntry[];
  items: FileTreeItem[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  setFocusedId: (id: string | undefined) => void;
  e: React.KeyboardEvent;
}) {
  opts.e.preventDefault();
  const curr = opts.visibleItems[opts.currentIndex];
  if (curr?.item.type === 'directory' && opts.expandedIds.has(curr.item.id)) opts.toggleExpand(curr.item.id);
  else if (curr && curr.depth > 0) {
    const parentEntry = findParent(opts.items, curr.item.id);
    if (parentEntry) opts.setFocusedId(parentEntry.id);
  }
}
function handleEnterSpace(opts: {
  currentIndex: number;
  visibleItems: VisibleEntry[];
  toggleExpand: (id: string) => void;
  onSelect: (item: FileTreeItem) => void;
  e: React.KeyboardEvent;
}) {
  opts.e.preventDefault();
  const selected = opts.visibleItems[opts.currentIndex];
  if (!selected) return;
  if (selected.item.type === 'directory') opts.toggleExpand(selected.item.id);
  opts.onSelect(selected.item);
}

export function FileTree({ items, selectedId, onSelect, onContextMenu, className }: FileTreeProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (selectedId) expandPathTo(items, selectedId, initial);
    return initial;
  });
  const [focusedId, setFocusedId] = React.useState<string | undefined>(selectedId);
  const visibleItems = React.useMemo(() => flattenVisible(items, expandedIds), [items, expandedIds]);
  const toggleExpand = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = visibleItems.findIndex((v) => v.item.id === focusedId);
      if (e.key === 'ArrowDown') handleArrowDown({ currentIndex, visibleItems, setFocusedId, e });
      else if (e.key === 'ArrowUp') handleArrowUp({ currentIndex, visibleItems, setFocusedId, e });
      else if (e.key === 'ArrowRight')
        handleArrowRight({ currentIndex, visibleItems, expandedIds, toggleExpand, setFocusedId, e });
      else if (e.key === 'ArrowLeft')
        handleArrowLeft({ currentIndex, visibleItems, items, expandedIds, toggleExpand, setFocusedId, e });
      else if (e.key === 'Enter' || e.key === ' ')
        handleEnterSpace({ currentIndex, visibleItems, toggleExpand, onSelect, e });
    },
    [visibleItems, focusedId, expandedIds, toggleExpand, onSelect, items],
  );
  return (
    <div
      role="tree"
      aria-label="File tree"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn('text-sm outline-none', className)}
    >
      {items.map((item) => (
        <FileTreeNode
          key={item.id}
          item={item}
          depth={0}
          selectedId={selectedId}
          focusedId={focusedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggleExpand={toggleExpand}
          onFocus={setFocusedId}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  item: FileTreeItem;
  depth: number;
  selectedId?: string;
  focusedId?: string;
  expandedIds: Set<string>;
  onSelect: (item: FileTreeItem) => void;
  onToggleExpand: (id: string) => void;
  onFocus: (id: string) => void;
  onContextMenu?: (item: FileTreeItem, e: React.MouseEvent) => void;
}

function FileTreeNodeButton({
  item,
  depth,
  isSelected,
  isFocused,
  isExpanded,
  isDirectory,
  Icon,
  onClick,
  onContextMenu,
}: {
  item: FileTreeItem;
  depth: number;
  isSelected: boolean;
  isFocused: boolean;
  isExpanded: boolean;
  isDirectory: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-focused={isFocused || undefined}
      data-selected={isSelected || undefined}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm transition-colors',
        'hover:bg-accent/50',
        'outline-none data-[focused]:ring-1 data-[focused]:ring-ring',
        isSelected ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground/80',
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      {isDirectory ? (
        <ChevronRightIcon
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150',
            isExpanded && 'rotate-90',
          )}
        />
      ) : (
        <span className="h-3.5 w-3.5 shrink-0" />
      )}
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{item.name}</span>
    </button>
  );
}

function FileTreeChildren({
  item,
  depth,
  selectedId,
  focusedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onFocus,
  onContextMenu,
}: FileTreeNodeProps) {
  if (!item.children) return null;
  return (
    <div role="group">
      {item.children.map((child) => (
        <FileTreeNode
          key={child.id}
          item={child}
          depth={depth + 1}
          selectedId={selectedId}
          focusedId={focusedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
          onFocus={onFocus}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}

function FileTreeNode({
  item,
  depth,
  selectedId,
  focusedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onFocus,
  onContextMenu,
}: FileTreeNodeProps) {
  const isDirectory = item.type === 'directory';
  const isExpanded = expandedIds.has(item.id);
  const isSelected = item.id === selectedId;
  const isFocused = item.id === focusedId;
  const Icon = item.icon ?? getDefaultIcon(item, isExpanded);
  const handleClick = () => {
    onFocus(item.id);
    if (isDirectory) onToggleExpand(item.id);
    onSelect(item);
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu?.(item, e);
  };
  return (
    <div role="treeitem" aria-expanded={isDirectory ? isExpanded : undefined} aria-selected={isSelected}>
      <FileTreeNodeButton
        item={item}
        depth={depth}
        isSelected={isSelected}
        isFocused={isFocused}
        isExpanded={isExpanded}
        isDirectory={isDirectory}
        Icon={Icon}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
      {isDirectory && isExpanded && (
        <FileTreeChildren
          item={item}
          depth={depth}
          selectedId={selectedId}
          focusedId={focusedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
          onFocus={onFocus}
          onContextMenu={onContextMenu}
        />
      )}
    </div>
  );
}

function getDefaultIcon(item: FileTreeItem, isExpanded: boolean) {
  if (item.type === 'directory') return isExpanded ? FolderOpenIcon : FolderIcon;
  return FileIcon;
}
interface VisibleEntry {
  item: FileTreeItem;
  depth: number;
}
function flattenVisible(items: FileTreeItem[], expanded: Set<string>, depth = 0): VisibleEntry[] {
  const result: VisibleEntry[] = [];
  for (const item of items) {
    result.push({ item, depth });
    if (item.type === 'directory' && expanded.has(item.id) && item.children)
      result.push(...flattenVisible(item.children, expanded, depth + 1));
  }
  return result;
}
function expandPathTo(items: FileTreeItem[], targetId: string, expanded: Set<string>): boolean {
  for (const item of items) {
    if (item.id === targetId) return true;
    if (item.type === 'directory' && item.children) {
      if (expandPathTo(item.children, targetId, expanded)) {
        expanded.add(item.id);
        return true;
      }
    }
  }
  return false;
}
function findParent(items: FileTreeItem[], targetId: string, parent?: FileTreeItem): FileTreeItem | undefined {
  for (const item of items) {
    if (item.id === targetId) return parent;
    if (item.type === 'directory' && item.children) {
      const found = findParent(item.children, targetId, item);
      if (found) return found;
    }
  }
  return undefined;
}
