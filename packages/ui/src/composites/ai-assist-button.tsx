'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import { Input } from '../primitives/input';
import { cn } from '../utils';

export interface AiAssistPreset {
  label: string;
  value: string;
}

interface AiAssistButtonProps {
  presets: AiAssistPreset[];
  onGenerate: (instruction: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

function PresetList({
  presets,
  onPresetClick,
  loading,
}: {
  presets: AiAssistPreset[];
  onPresetClick: (value: string) => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {presets.map((preset) => (
        <button
          key={preset.value}
          type="button"
          className="text-[11px] px-2 py-1 rounded-md bg-muted hover:bg-accent text-foreground transition-colors"
          onClick={() => onPresetClick(preset.value)}
          disabled={loading}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

function CustomInputRow({
  value,
  onChange,
  onSubmit,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex gap-1.5">
      <Input
        placeholder="Custom instructions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        className="h-7 text-xs flex-1"
        disabled={loading}
      />
      <Button
        type="button"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={onSubmit}
        disabled={!value.trim() || loading}
      >
        Go
      </Button>
    </div>
  );
}

function doSingleClick(
  clickCount: React.MutableRefObject<number>,
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  setOpen: (v: boolean) => void,
) {
  timerRef.current = setTimeout(() => {
    clickCount.current = 0;
    setOpen(true);
  }, 250);
}

function doDoubleClick(
  clickCount: React.MutableRefObject<number>,
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  presets: AiAssistPreset[],
  onGenerate: (v: string) => void,
) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
  clickCount.current = 0;
  if (presets.length > 0) onGenerate(presets[0].value);
}

export function AiAssistButton({
  presets,
  onGenerate,
  loading = false,
  disabled = false,
  className,
}: AiAssistButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [customInstruction, setCustomInstruction] = React.useState('');
  const clickCount = React.useRef(0);
  const clickTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (loading || disabled) return;
      clickCount.current += 1;
      if (clickCount.current === 1) doSingleClick(clickCount, clickTimer, setOpen);
      else if (clickCount.current >= 2) doDoubleClick(clickCount, clickTimer, presets, onGenerate);
    },
    [presets, onGenerate, loading, disabled],
  );

  const handlePresetClick = React.useCallback(
    (value: string) => {
      setOpen(false);
      setCustomInstruction('');
      onGenerate(value);
    },
    [onGenerate],
  );

  const handleCustomSubmit = React.useCallback(() => {
    const trimmed = customInstruction.trim();
    if (!trimmed) return;
    setOpen(false);
    onGenerate(trimmed);
    setCustomInstruction('');
  }, [customInstruction, onGenerate]);

  React.useEffect(
    () => () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
    },
    [],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6', className)}
          disabled={disabled || loading}
          onClick={handleClick}
          title="Double-click for quick AI assist"
        >
          <Sparkles
            className={cn(
              'h-3.5 w-3.5',
              loading && 'animate-pulse text-primary',
              !loading && 'text-muted-foreground hover:text-foreground',
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3 space-y-2.5">
        <p className="text-xs font-medium text-muted-foreground">AI Assist</p>
        <PresetList presets={presets} onPresetClick={handlePresetClick} loading={loading} />
        <CustomInputRow
          value={customInstruction}
          onChange={setCustomInstruction}
          onSubmit={handleCustomSubmit}
          loading={loading}
        />
      </PopoverContent>
    </Popover>
  );
}
