'use client';

import * as React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../primitives/dropdown-menu';
import { Input } from '../primitives/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';

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

function SearchField({
  searchQuery,
  setSearchQuery,
  placeholder,
  shortcut,
  inputRef,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  placeholder: string;
  shortcut?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="p-2">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-sm pr-10"
          aria-label="Search filter values"
        />
        {shortcut && (
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-60">
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );
}

function FilterGroups({ groups }: { groups: FilterGroup[] }) {
  if (groups.length === 0)
    return <div className="px-2 py-6 text-center text-sm text-muted-foreground">No filters found</div>;
  return (
    <>
      {groups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          {groupIndex > 0 && <DropdownMenuSeparator />}
          <div className="px-1">
            {group.items.map((item) => (
              <DropdownMenuSub key={item.id}>
                <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm">
                  {item.icon}
                  <span>{item.label}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48 p-1">{item.content}</DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

function getAllItems(items: FilterItem[], groups: FilterGroup[]) {
  if (items.length > 0) return items;
  return groups.flatMap((group) => group.items);
}
function getFilteredItems(allItems: FilterItem[], showSearch: boolean, searchQuery: string) {
  if (!showSearch || !searchQuery) return allItems;
  const q = searchQuery.toLowerCase();
  return allItems.filter((item) => item.label.toLowerCase().includes(q));
}
function getFilteredGroups(groups: FilterGroup[], filteredItems: FilterItem[], itemsLength: number) {
  if (itemsLength > 0 || groups.length === 0) return [{ id: 'default', items: filteredItems }];
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => filteredItems.includes(item)) }))
    .filter((group) => group.items.length > 0);
}
function resolveOpen(open: boolean | undefined, internalOpen: boolean) {
  return open ?? internalOpen;
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
  const isOpen = resolveOpen(open, internalOpen);
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
  const allItems = React.useMemo(() => getAllItems(items, groups), [items, groups]);
  const filteredItems = React.useMemo(
    () => getFilteredItems(allItems, showSearch, searchQuery),
    [allItems, searchQuery, showSearch],
  );
  const filteredGroups = React.useMemo(
    () => getFilteredGroups(groups, filteredItems, items.length),
    [groups, filteredItems, items.length],
  );
  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{trigger ?? <DefaultTrigger />}</DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-52 p-0">
        {showHeader && (
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">{headerTitle}</span>
          </div>
        )}
        {showSearch && (
          <SearchField
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder={searchPlaceholder}
            shortcut={searchKeyboardShortcut}
            inputRef={searchInputRef}
          />
        )}
        <div className="py-1">
          <FilterGroups groups={filteredGroups} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
