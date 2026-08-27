'use client';

import * as React from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '../primitives/button';
import { Switch } from '../primitives/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import { ComboboxSelect, type ComboboxOption } from './combobox-select';
import { ViewTypeTabs } from './view-type-tabs';
import { GroupingOrderingSection } from './grouping-ordering-section';

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
          JSON.stringify({
            ...next,
            visibleProperties: Array.from(next.visibleProperties),
          }),
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

function PopoverHeader({
  settings,
  update,
  groupingOptions,
  orderingOptions,
  flags,
  isGroupingVisible,
  isGraph,
}: {
  settings: DisplaySettings;
  update: (p: Partial<DisplaySettings>) => void;
  groupingOptions: ComboboxOption[];
  orderingOptions: ComboboxOption[];
  flags: { board: boolean; graph: boolean; calendar: boolean; org: boolean };
  isGroupingVisible: boolean;
  isGraph: boolean;
}) {
  return (
    <>
      <ViewTypeTabs view={settings.view} update={update} flags={flags} />
      {isGroupingVisible && (
        <GroupingOrderingSection
          settings={settings}
          update={update}
          groupingOptions={groupingOptions}
          orderingOptions={orderingOptions}
        />
      )}
      {isGraph && <GraphConnections settings={settings} update={update} />}
    </>
  );
}

function usePopoverState(
  settings: DisplaySettings,
  onSettingsChange: (s: DisplaySettings) => void,
  flags: { board: boolean; graph: boolean; calendar: boolean; org: boolean },
) {
  const update = (patch: Partial<DisplaySettings>) => onSettingsChange({ ...settings, ...patch });
  const toggleProperty = (id: string) => {
    const next = new Set(settings.visibleProperties);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update({ visibleProperties: next });
  };
  const isGroupingVisible = settings.view !== 'graph' && settings.view !== 'org';
  const isGraph = settings.view === 'graph';
  return { update, toggleProperty, isGroupingVisible, isGraph, flags };
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
  const flags = { board: enableBoardView, graph: enableGraphView, calendar: enableCalendarView, org: enableOrgView };
  const { update, toggleProperty, isGroupingVisible, isGraph } = usePopoverState(settings, onSettingsChange, flags);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Settings2 className="h-3.5 w-3.5" /> Display
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[320px] p-0" align="end">
        <PopoverHeader
          settings={settings}
          update={update}
          groupingOptions={groupingOptions}
          orderingOptions={orderingOptions}
          flags={flags}
          isGroupingVisible={isGroupingVisible}
          isGraph={isGraph}
        />
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
