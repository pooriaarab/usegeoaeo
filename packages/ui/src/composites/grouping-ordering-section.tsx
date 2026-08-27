'use client';

import { ArrowUpDown, Layers } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../primitives/button';
import { ComboboxSelect, type ComboboxOption } from './combobox-select';
import type { DisplaySettings } from './display-popover';

function LabeledCombobox({
  label,
  value,
  onValueChange,
  options,
}: {
  label: React.ReactNode;
  value: string;
  onValueChange: (v: string) => void;
  options: ComboboxOption[];
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-[90px] items-center gap-1.5 text-xs text-muted-foreground">
        <Layers className="h-3.5 w-3.5" /> {label}
      </div>
      <ComboboxSelect
        value={value}
        onValueChange={onValueChange}
        options={options}
        className="flex-1"
      />
    </div>
  );
}

function OrderingRow({
  settings,
  update,
  orderingOptions,
}: {
  settings: DisplaySettings;
  update: (patch: Partial<DisplaySettings>) => void;
  orderingOptions: ComboboxOption[];
}) {
  return (
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
        onClick={() =>
          update({
            orderDirection: settings.orderDirection === 'asc' ? 'desc' : 'asc',
          })
        }
        aria-label="Toggle sort direction"
      >
        <ArrowUpDown
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            settings.orderDirection === 'desc' && 'rotate-180',
          )}
        />
      </Button>
    </div>
  );
}

export function GroupingOrderingSection({
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
      <LabeledCombobox
        label="Grouping"
        value={settings.grouping}
        onValueChange={(v) => update({ grouping: v })}
        options={groupingOptions}
      />
      <LabeledCombobox
        label="Sub-grouping"
        value={settings.subGrouping}
        onValueChange={(v) => update({ subGrouping: v })}
        options={groupingOptions}
      />
      <OrderingRow
        settings={settings}
        update={update}
        orderingOptions={orderingOptions}
      />
    </div>
  );
}
