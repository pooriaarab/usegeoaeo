'use client';

import * as React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../primitives/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';
import {
  FilterGroups,
  SearchField,
  getAllItems,
  getFilteredGroups,
  getFilteredItems,
  resolveOpen,
} from './table-filter-content';

export interface FilterItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  shortcut?: string;
}
export interface FilterGroup {
  id: string;
  items: FilterItem[];
}
interface TableFilterProps {
  items?: FilterItem[];
  groups?: FilterGroup[];
  trigger?: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchKeyboardShortcut?: string;
  showHeader?: boolean;
  headerTitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
const EMPTY_ITEMS: FilterItem[] = [];
const EMPTY_GROUPS: FilterGroup[] = [];

function DefaultTrigger() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 gap-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Filter className="size-4" />
          Filter
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">Filter</TooltipContent>
    </Tooltip>
  );
}

function FilterHeader({ showHeader, headerTitle }: { showHeader: boolean; headerTitle: string }) {
  if (!showHeader) return null;
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b">
      <span className="text-sm font-medium">{headerTitle}</span>
    </div>
  );
}

function useTableFilterState(opts: {
  items: FilterItem[];
  groups: FilterGroup[];
  showSearch: boolean;
  searchQuery: string;
  open: boolean | undefined;
  internalOpen: boolean;
}) {
  const isOpen = resolveOpen(opts.open, opts.internalOpen);
  const allItems = React.useMemo(() => getAllItems(opts.items, opts.groups), [opts.items, opts.groups]);
  const filteredItems = React.useMemo(
    () => getFilteredItems(allItems, opts.showSearch, opts.searchQuery),
    [allItems, opts.searchQuery, opts.showSearch],
  );
  const filteredGroups = React.useMemo(
    () => getFilteredGroups(opts.groups, filteredItems, opts.items.length),
    [opts.groups, filteredItems, opts.items.length],
  );
  return { isOpen, filteredGroups };
}

function FilterDropdownContent(opts: {
  showHeader: boolean;
  headerTitle: string;
  showSearch: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchPlaceholder: string;
  searchKeyboardShortcut?: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  filteredGroups: FilterGroup[];
}) {
  return (
    <>
      <FilterHeader showHeader={opts.showHeader} headerTitle={opts.headerTitle} />
      {opts.showSearch && (
        <SearchField
          searchQuery={opts.searchQuery}
          setSearchQuery={opts.setSearchQuery}
          placeholder={opts.searchPlaceholder}
          shortcut={opts.searchKeyboardShortcut}
          inputRef={opts.searchInputRef}
        />
      )}
      <div className="py-1">
        <FilterGroups groups={opts.filteredGroups} />
      </div>
    </>
  );
}

export function TableFilter({
  items = EMPTY_ITEMS,
  groups = EMPTY_GROUPS,
  trigger,
  showSearch = false,
  searchPlaceholder = 'Filter by…',
  searchKeyboardShortcut,
  showHeader = true,
  headerTitle = 'Filter',
  open,
  onOpenChange,
}: TableFilterProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const { isOpen, filteredGroups } = useTableFilterState({
    items, groups, showSearch, searchQuery, open, internalOpen,
  });
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      const handler = onOpenChange ?? setInternalOpen;
      handler(newOpen);
      if (!newOpen) setSearchQuery('');
    },
    [onOpenChange],
  );
  React.useEffect(() => {
    if (isOpen && showSearch) setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [isOpen, showSearch]);
  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{trigger ?? <DefaultTrigger />}</DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-52 p-0">
        <FilterDropdownContent
          showHeader={showHeader}
          headerTitle={headerTitle}
          showSearch={showSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder={searchPlaceholder}
          searchKeyboardShortcut={searchKeyboardShortcut}
          searchInputRef={searchInputRef}
          filteredGroups={filteredGroups}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
