'use client';

import * as React from 'react';
import {
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../primitives/dropdown-menu';
import { Input } from '../primitives/input';
import type { FilterGroup, FilterItem } from './table-filter';

export function SearchField({
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
          <kbd
            className={
              "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none " +
              "inline-flex h-5 select-none items-center gap-1 rounded border " +
              "bg-muted px-1.5 font-mono text-[10px] font-medium " +
              "text-muted-foreground opacity-60"
            }
          >
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );
}

export function FilterGroups({ groups }: { groups: FilterGroup[] }) {
  if (groups.length === 0) {
    return <div className="px-2 py-6 text-center text-sm text-muted-foreground">No filters found</div>;
  }
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

export function getAllItems(items: FilterItem[], groups: FilterGroup[]) {
  if (items.length > 0) return items;
  return groups.flatMap((group) => group.items);
}

export function getFilteredItems(allItems: FilterItem[], showSearch: boolean, searchQuery: string) {
  if (!showSearch || !searchQuery) return allItems;
  const q = searchQuery.toLowerCase();
  return allItems.filter((item) => item.label.toLowerCase().includes(q));
}

export function getFilteredGroups(groups: FilterGroup[], filteredItems: FilterItem[], itemsLength: number) {
  if (itemsLength > 0 || groups.length === 0) return [{ id: 'default', items: filteredItems }];
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => filteredItems.includes(item)),
    }))
    .filter((group) => group.items.length > 0);
}

export function resolveOpen(open: boolean | undefined, internalOpen: boolean) {
  return open ?? internalOpen;
}
