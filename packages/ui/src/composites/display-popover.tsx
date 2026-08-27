'use client';

import * as React from 'react';
import { Table2, LayoutGrid, Network, ArrowUpDown, Layers, Settings2, Calendar, GitBranch } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../primitives/button';
import { Switch } from '../primitives/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import { ComboboxSelect, type ComboboxOption } from './combobox-select';

export type ViewType = 'list' | 'board' | 'graph' | 'calendar' | 'org';

export interface DisplayProperty {
  id: string;
  label: string;
}

export interface DisplaySettings {
  view: ViewType;
  grouping: string;
  subGrouping: string;
  ordering: string;
  orderDirection: 'asc' | 'desc';
  showEmptyGroups: boolean;
  visibleProperties: Set<string>;
  graphTagEdges?: boolean;
  graphTemporalEdges?: boolean;
  graphTemporalGapHours?: number;
  graphEntityEdges?: boolean;
}

export function useDisplaySettings(
  pageKey: string,
  defaultSettings: DisplaySettings,
): [DisplaySettings, (s: DisplaySettings) => void] {
  const [settings, setSettingsRaw] = React.useState<DisplaySettings>(defaultSettings);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`display-settings:${pageKey}`);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const visibleProperties =
        Array.isArray(parsed.visibleProperties) && parsed.visibleProperties.length > 0
          ? new Set<string>(parsed.visibleProperties)
          : defaultSettings.visibleProperties;
      setSettingsRaw({ ...defaultSettings, ...parsed, visibleProperties });
    } catch {
      // localStorage may be unavailable — silently ignore
    }
  }, [pageKey, defaultSettings]);

  const setSettings = React.useCallback(
    (next: DisplaySettings) => {
      setSettingsRaw(next);
      try {
        localStorage.setItem(
          `display-settings:${pageKey}`,
          JSON.stringify({ ...next, visibleProperties: Array.from(next.visibleProperties) }),
        );
      } catch {
        // localStorage may be unavailable — silently ignore
      }
    },
    [pageKey],
  );
  return [settings, setSettings];
}

interface DisplayPopoverProps {
  settings: DisplaySettings;
  onSettingsChange: (settings: DisplaySettings) => void;
  groupingOptions: ComboboxOption[];
  orderingOptions: ComboboxOption[];
  displayProperties: DisplayProperty[];
  defaultSettings: DisplaySettings;
  enableBoardView?: boolean;
  enableGraphView?: boolean;
  enableCalendarView?: boolean;
  enableOrgView?: boolean;
  extraToggles?: React.ReactNode;
}

function ViewTypeTabs({
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
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 gap-1.5 text-xs"
        onClick={() => update({ view: 'list' })}
      >
        <Table2 className="h-3.5 w-3.5" /> List
      </Button>
      {flags.board && (
        <Button
          variant={view === 'board' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => update({ view: 'board' })}
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Board
        </Button>
      )}
      {flags.graph && (
        <Button
          variant={view === 'graph' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => update({ view: 'graph' })}
        >
          <Network className="h-3.5 w-3.5" /> Graph
        </Button>
      )}
      {flags.calendar && (
        <Button
          variant={view === 'calendar' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => update({ view: 'calendar' })}
        >
          <Calendar className="h-3.5 w-3.5" /> Calendar
        </Button>
      )}
      {flags.org && (
        <Button
          variant={view === 'org' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => update({ view: 'org' })}
        >
          <GitBranch className="h-3.5 w-3.5" /> Org
        </Button>
      )}
    </div>
  );
}

function GroupingOrderingSection({
  settings,
  update,
  groupingOptions,
  orderingOptions,
}: {
  settings: DisplaySettings;
  update: (patch: Partial<DisplaySettings>) => void;
  groupingOptions: ComboboxOption[];
  orderingOptions: ComboboxOption[];
}) {
  return (
    <div className="space-y-2.5 border-b p-3">
      <div className="flex items-center gap-2">
        <div className="flex min-w-[90px] items-center gap-1.5 text-xs text-muted-foreground">
          <Layers className="h-3.5 w-3.5" /> Grouping
        </div>
        <ComboboxSelect
          value={settings.grouping}
          onValueChange={(v) => update({ grouping: v })}
          options={groupingOptions}
          className="flex-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex min-w-[90px] items-center gap-1.5 text-xs text-muted-foreground">
          <Layers className="h-3.5 w-3.5" /> Sub-grouping
        </div>
        <ComboboxSelect
          value={settings.subGrouping}
          onValueChange={(v) => update({ subGrouping: v })}
          options={groupingOptions}
          className="flex-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex min-w-[90px] items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" /> Ordering
        </div>
        <ComboboxSelect
          value={settings.ordering}
          onValueChange={(v) => update({ ordering: v })}
          options={orderingOptions}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon-xs"
          className="h-8 w-8 shrink-0"
          onClick={() => update({ orderDirection: settings.orderDirection === 'asc' ? 'desc' : 'asc' })}
          aria-label="Toggle sort direction"
        >
          <ArrowUpDown
            className={cn('h-3.5 w-3.5 transition-transform', settings.orderDirection === 'desc' && 'rotate-180')}
          />
        </Button>
      </div>
    </div>
  );
}

function GraphConnections({
  settings,
  update,
}: {
  settings: DisplaySettings;
  update: (patch: Partial<DisplaySettings>) => void;
}) {
  return (
    <div className="space-y-2.5 border-b p-3">
      <span className="text-xs font-medium">Connections</span>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Tag connections</span>
        <Switch checked={settings.graphTagEdges !== false} onCheckedChange={(v) => update({ graphTagEdges: !!v })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Entity connections</span>
        <Switch
          checked={settings.graphEntityEdges === true}
          onCheckedChange={(v) => update({ graphEntityEdges: !!v })}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Temporal proximity</span>
        <Switch
          checked={settings.graphTemporalEdges === true}
          onCheckedChange={(v) => update({ graphTemporalEdges: !!v })}
        />
      </div>
      {settings.graphTemporalEdges && (
        <div className="flex items-center gap-2">
          <div className="flex min-w-[90px] items-center gap-1.5 text-xs text-muted-foreground">Time gap</div>
          <ComboboxSelect
            value={String(settings.graphTemporalGapHours ?? 24)}
            onValueChange={(v) => update({ graphTemporalGapHours: Number(v) })}
            options={[
              { value: '1', label: '1 hour' },
              { value: '6', label: '6 hours' },
              { value: '24', label: '1 day' },
              { value: '168', label: '7 days' },
            ]}
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
}

function OptionsSection({
  settings,
  update,
  extraToggles,
}: {
  settings: DisplaySettings;
  update: (p: Partial<DisplaySettings>) => void;
  extraToggles?: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5 border-b p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Show empty groups</span>
        <Switch checked={settings.showEmptyGroups} onCheckedChange={(v) => update({ showEmptyGroups: !!v })} />
      </div>
      {extraToggles}
    </div>
  );
}

function DisplayPropertiesSection({
  displayProperties,
  visibleProperties,
  toggleProperty,
}: {
  displayProperties: DisplayProperty[];
  visibleProperties: Set<string>;
  toggleProperty: (id: string) => void;
}) {
  return (
    <div className="space-y-2 border-b p-3">
      <span className="text-xs font-medium">Display properties</span>
      <div className="flex flex-wrap gap-1">
        {displayProperties.map((prop) => (
          <Button
            key={prop.id}
            variant={visibleProperties.has(prop.id) ? 'secondary' : 'outline'}
            className="h-6 px-2 text-[11px]"
            onClick={() => toggleProperty(prop.id)}
          >
            {prop.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function DisplayPopover({
  settings,
  onSettingsChange,
  groupingOptions,
  orderingOptions,
  displayProperties,
  defaultSettings,
  enableBoardView = true,
  enableGraphView = false,
  enableCalendarView = false,
  enableOrgView = false,
  extraToggles,
}: DisplayPopoverProps) {
  const update = (patch: Partial<DisplaySettings>) => onSettingsChange({ ...settings, ...patch });
  const toggleProperty = (id: string) => {
    const next = new Set(settings.visibleProperties);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update({ visibleProperties: next });
  };
  const isGroupingVisible = settings.view !== 'graph' && settings.view !== 'org';
  const isGraph = settings.view === 'graph';
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Settings2 className="h-3.5 w-3.5" /> Display
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[320px] p-0" align="end">
        <ViewTypeTabs
          view={settings.view}
          update={update}
          flags={{ board: enableBoardView, graph: enableGraphView, calendar: enableCalendarView, org: enableOrgView }}
        />
        {isGroupingVisible && (
          <GroupingOrderingSection
            settings={settings}
            update={update}
            groupingOptions={groupingOptions}
            orderingOptions={orderingOptions}
          />
        )}
        {isGraph && <GraphConnections settings={settings} update={update} />}
        <OptionsSection settings={settings} update={update} extraToggles={extraToggles} />
        <DisplayPropertiesSection
          displayProperties={displayProperties}
          visibleProperties={settings.visibleProperties}
          toggleProperty={toggleProperty}
        />
        <div className="flex justify-end p-3">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSettingsChange(defaultSettings)}>
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
