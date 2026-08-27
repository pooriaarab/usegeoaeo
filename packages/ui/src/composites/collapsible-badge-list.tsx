'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '../utils';

interface CollapsibleBadgeListProps {
  children: ReactNode;
  /** Maximum visible rows before collapsing. Default: 2 */
  maxRows?: number;
  /** CSS class for the container */
  className?: string;
  /** Total number of items (used for "+N more" count when collapsed) */
  totalCount: number;
}

function calcCollapsedHeight(el: HTMLElement, maxRows: number) {
  const firstChild = el.firstElementChild as HTMLElement | null;
  if (!firstChild) return null;
  const rowHeight = firstChild.offsetHeight;
  const gap = parseFloat(getComputedStyle(el).rowGap) || 4;
  const maxHeight = rowHeight * maxRows + gap * (maxRows - 1);
  const overflows = el.scrollHeight > maxHeight + rowHeight * 0.5;
  return { maxHeight, overflows };
}

function ToggleButton({
  expanded,
  totalCount,
  onToggle,
}: {
  expanded: boolean;
  totalCount: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {expanded ? 'Show less' : `+${totalCount} total — show all`}
    </button>
  );
}

export function CollapsibleBadgeList({ children, maxRows = 2, className, totalCount }: CollapsibleBadgeListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const result = calcCollapsedHeight(el, maxRows);
    if (!result) return;
    setIsOverflowing(result.overflows);
    setCollapsedHeight(result.maxHeight);
  }, [maxRows]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const collapsedStyle = !expanded && isOverflowing && collapsedHeight ? { maxHeight: collapsedHeight } : undefined;

  return (
    <div className="space-y-1">
      <div
        ref={containerRef}
        className={cn('flex flex-wrap gap-1 overflow-hidden transition-[max-height] duration-200', className)}
        style={collapsedStyle}
      >
        {children}
      </div>
      {isOverflowing && (
        <ToggleButton expanded={expanded} totalCount={totalCount} onToggle={() => setExpanded((prev) => !prev)} />
      )}
    </div>
  );
}
