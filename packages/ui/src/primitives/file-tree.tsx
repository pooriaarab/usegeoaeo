"use client";

import * as React from "react";
import { cn } from "../utils";
import { FileTreeNode } from "./file-tree-node";

export interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "directory";
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
  if (current?.item.type !== "directory") return;
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
  if (curr?.item.type === "directory" && opts.expandedIds.has(curr.item.id))
    opts.toggleExpand(curr.item.id);
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
  if (selected.item.type === "directory") opts.toggleExpand(selected.item.id);
  opts.onSelect(selected.item);
}

function useFileTreeState(items: FileTreeItem[], selectedId?: string) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (selectedId) expandPathTo(items, selectedId, initial);
    return initial;
  });
  const [focusedId, setFocusedId] = React.useState<string | undefined>(selectedId);
  const visibleItems = React.useMemo(
    () => flattenVisible(items, expandedIds),
    [items, expandedIds],
  );
  const toggleExpand = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  return { expandedIds, focusedId, setFocusedId, visibleItems, toggleExpand };
}

function useFileTreeKeyDown(opts: {
  items: FileTreeItem[];
  selectedId?: string;
  onSelect: (item: FileTreeItem) => void;
}) {
  const { expandedIds, focusedId, setFocusedId, visibleItems, toggleExpand } = useFileTreeState(
    opts.items,
    opts.selectedId,
  );
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = visibleItems.findIndex((v) => v.item.id === focusedId);
      if (e.key === "ArrowDown") handleArrowDown({ currentIndex, visibleItems, setFocusedId, e });
      else if (e.key === "ArrowUp") handleArrowUp({ currentIndex, visibleItems, setFocusedId, e });
      else if (e.key === "ArrowRight")
        handleArrowRight({
          currentIndex,
          visibleItems,
          expandedIds,
          toggleExpand,
          setFocusedId,
          e,
        });
      else if (e.key === "ArrowLeft")
        handleArrowLeft({
          currentIndex,
          visibleItems,
          items: opts.items,
          expandedIds,
          toggleExpand,
          setFocusedId,
          e,
        });
      else if (e.key === "Enter" || e.key === " ")
        handleEnterSpace({ currentIndex, visibleItems, toggleExpand, onSelect: opts.onSelect, e });
    },
    [visibleItems, focusedId, expandedIds, toggleExpand, opts.onSelect, opts.items],
  );
  return { expandedIds, focusedId, setFocusedId, toggleExpand, handleKeyDown };
}

export function FileTree({ items, selectedId, onSelect, onContextMenu, className }: FileTreeProps) {
  const { expandedIds, focusedId, setFocusedId, toggleExpand, handleKeyDown } = useFileTreeKeyDown({
    items,
    selectedId,
    onSelect,
  });
  return (
    <div
      role="tree"
      aria-label="File tree"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn("text-sm outline-none", className)}
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

interface VisibleEntry {
  item: FileTreeItem;
  depth: number;
}
function flattenVisible(items: FileTreeItem[], expanded: Set<string>, depth = 0): VisibleEntry[] {
  const result: VisibleEntry[] = [];
  for (const item of items) {
    result.push({ item, depth });
    if (item.type === "directory" && expanded.has(item.id) && item.children)
      result.push(...flattenVisible(item.children, expanded, depth + 1));
  }
  return result;
}
function expandPathTo(items: FileTreeItem[], targetId: string, expanded: Set<string>): boolean {
  for (const item of items) {
    if (item.id === targetId) return true;
    if (item.type === "directory" && item.children) {
      if (expandPathTo(item.children, targetId, expanded)) {
        expanded.add(item.id);
        return true;
      }
    }
  }
  return false;
}
function findParent(
  items: FileTreeItem[],
  targetId: string,
  parent?: FileTreeItem,
): FileTreeItem | undefined {
  for (const item of items) {
    if (item.id === targetId) return parent;
    if (item.type === "directory" && item.children) {
      const found = findParent(item.children, targetId, item);
      if (found) return found;
    }
  }
  return undefined;
}
