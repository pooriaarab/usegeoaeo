'use client';

import { FolderIcon, FolderOpenIcon, FileIcon } from 'lucide-react';
import { FileTreeNodeButton } from './file-tree-node-button';
import type { FileTreeItem } from './file-tree';

export interface FileTreeNodeProps {
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

function getDefaultIcon(item: FileTreeItem, isExpanded: boolean) {
  if (item.type === 'directory') return isExpanded ? FolderOpenIcon : FolderIcon;
  return FileIcon;
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

function useNodeState(item: FileTreeItem, selectedId?: string, focusedId?: string, expandedIds?: Set<string>) {
  const isDirectory = item.type === 'directory';
  const isExpanded = expandedIds?.has(item.id) ?? false;
  const isSelected = item.id === selectedId;
  const isFocused = item.id === focusedId;
  const Icon = item.icon ?? getDefaultIcon(item, isExpanded);
  return { isDirectory, isExpanded, isSelected, isFocused, Icon };
}

type NodeButtonRowProps = {
  item: import('./file-tree').FileTreeItem;
  depth: number;
  isDirectory: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isFocused: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
};
function NodeButtonRow(props: NodeButtonRowProps) {
  return (
    <FileTreeNodeButton
      item={props.item}
      depth={props.depth}
      isSelected={props.isSelected}
      isFocused={props.isFocused}
      isExpanded={props.isExpanded}
      isDirectory={props.isDirectory}
      Icon={props.Icon}
      onClick={props.onClick}
      onContextMenu={props.onContextMenu}
    />
  );
}

export function FileTreeNode({
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
  const { isDirectory, isExpanded, isSelected, isFocused, Icon } =
    useNodeState(item, selectedId, focusedId, expandedIds);
  const handleClick = () => {
    onFocus(item.id);
    if (isDirectory) onToggleExpand(item.id);
    onSelect(item);
  };
  const handleContextMenu = (e: React.MouseEvent) => { onContextMenu?.(item, e); };
  return (
    <div role="treeitem" aria-expanded={isDirectory ? isExpanded : undefined} aria-selected={isSelected}>
      <NodeButtonRow
        item={item}
        depth={depth}
        isDirectory={isDirectory}
        isExpanded={isExpanded}
        isSelected={isSelected}
        isFocused={isFocused}
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
