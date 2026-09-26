"use client";

import { ChevronRightIcon } from "lucide-react";
import { cn } from "../utils";
import type { FileTreeItem } from "./file-tree";

function ExpandIcon({ isExpanded, isDirectory }: { isExpanded: boolean; isDirectory: boolean }) {
  if (!isDirectory) return <span className="h-3.5 w-3.5 shrink-0" />;
  return (
    <ChevronRightIcon
      className={cn(
        "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
        isExpanded && "rotate-90",
      )}
    />
  );
}

export function FileTreeNodeButton({
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
        "flex w-full items-center gap-1.5 rounded-md px-2 py-1",
        "text-left text-sm transition-colors",
        "hover:bg-accent/50",
        "outline-none data-[focused]:ring-1 data-[focused]:ring-ring",
        isSelected ? "bg-accent text-accent-foreground font-medium" : "text-foreground/80",
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <ExpandIcon isExpanded={isExpanded} isDirectory={isDirectory} />
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{item.name}</span>
    </button>
  );
}
