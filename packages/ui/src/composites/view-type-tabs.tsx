'use client';

import { Table2, LayoutGrid, Network, Calendar, GitBranch } from 'lucide-react';
import { Button } from '../primitives/button';
import type { DisplaySettings, ViewType } from './display-popover';

function ViewTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      className="h-7 gap-1.5 text-xs"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function ViewTypeTabs({
  view,
  update,
  flags,
}: {
  view: ViewType;
  update: (patch: Partial<DisplaySettings>) => void;
  flags: { board: boolean; graph: boolean; calendar: boolean; org: boolean };
}) {
  return (
    <div className="flex items-center gap-1 border-b p-3">
      <ViewTabButton active={view === 'list'} onClick={() => update({ view: 'list' })}>
        <Table2 className="h-3.5 w-3.5" /> List
      </ViewTabButton>
      {flags.board && (
        <ViewTabButton active={view === 'board'} onClick={() => update({ view: 'board' })}>
          <LayoutGrid className="h-3.5 w-3.5" /> Board
        </ViewTabButton>
      )}
      {flags.graph && (
        <ViewTabButton active={view === 'graph'} onClick={() => update({ view: 'graph' })}>
          <Network className="h-3.5 w-3.5" /> Graph
        </ViewTabButton>
      )}
      {flags.calendar && (
        <ViewTabButton
          active={view === 'calendar'}
          onClick={() => update({ view: 'calendar' })}
        >
          <Calendar className="h-3.5 w-3.5" /> Calendar
        </ViewTabButton>
      )}
      {flags.org && (
        <ViewTabButton active={view === 'org'} onClick={() => update({ view: 'org' })}>
          <GitBranch className="h-3.5 w-3.5" /> Org
        </ViewTabButton>
      )}
    </div>
  );
}
