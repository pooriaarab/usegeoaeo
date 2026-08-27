'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../primitives/command';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ComboboxSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

function SelectedLabel({ selected, placeholder }: { selected?: ComboboxOption; placeholder: string }) {
  if (selected) {
    return (
      <span className="flex items-center gap-1.5 min-w-0">
        {selected.icon}
        <span className="truncate">{selected.label}</span>
      </span>
    );
  }
  return <span className="truncate">{placeholder}</span>;
}

function OptionRow({
  option,
  value,
  onSelect,
}: {
  option: ComboboxOption;
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <CommandItem key={option.value} value={option.label} onSelect={() => onSelect(option.value)} className="text-sm">
      <Check className={cn('mr-1.5 h-3.5 w-3.5', value === option.value ? 'opacity-100' : 'opacity-0')} />
      {option.icon && <span className="mr-1.5">{option.icon}</span>}
      {option.label}
    </CommandItem>
  );
}

function ComboboxList({
  listboxId,
  searchPlaceholder,
  emptyText,
  options,
  value,
  onSelect,
}: {
  listboxId: string;
  searchPlaceholder: string;
  emptyText: string;
  options: ComboboxOption[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder={searchPlaceholder} className="h-9 text-sm" />
      <CommandList id={listboxId} className="max-h-[260px] [&>div]:max-h-[inherit] [&>div]:overflow-y-auto">
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <OptionRow key={option.value} option={option} value={value} onSelect={onSelect} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function ComboboxTrigger({
  selected,
  placeholder,
  open,
  listboxId,
  disabled,
  className,
}: {
  selected?: ComboboxOption;
  placeholder: string;
  open: boolean;
  listboxId: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      aria-controls={listboxId}
      disabled={disabled}
      className={cn('justify-between h-9 text-sm font-normal', className)}
    >
      <SelectedLabel selected={selected} placeholder={placeholder} />
      <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
    </Button>
  );
}

function useComboboxState(value: string, options: ComboboxOption[], onValueChange: (v: string) => void) {
  const [open, setOpen] = React.useState(false);
  const listboxId = React.useId();
  const selected = options.find((o) => o.value === value);
  const handleSelect = React.useCallback(
    (v: string) => {
      onValueChange(v);
      setOpen(false);
    },
    [onValueChange],
  );
  return { open, setOpen, listboxId, selected, handleSelect };
}

export function ComboboxSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  className,
  disabled,
}: ComboboxSelectProps) {
  const { open, setOpen, listboxId, selected, handleSelect } = useComboboxState(value, options, onValueChange);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ComboboxTrigger
          selected={selected}
          placeholder={placeholder}
          open={open}
          listboxId={listboxId}
          disabled={disabled}
          className={className}
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <ComboboxList
          listboxId={listboxId}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          options={options}
          value={value}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
