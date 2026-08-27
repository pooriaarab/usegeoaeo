'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../primitives/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../primitives/popover';
import { cn } from '../utils';
import { AiAssistPopoverContent } from './ai-assist-popover-content';
import type { AiAssistPreset } from './ai-assist-popover-content';

export type { AiAssistPreset } from './ai-assist-popover-content';

interface AiAssistButtonProps {
  presets: AiAssistPreset[];
  onGenerate: (instruction: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
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

function useCleanupTimer(timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, [timerRef]);
}

function useAiAssistState(
  presets: AiAssistPreset[],
  onGenerate: (v: string) => void,
  loading: boolean,
  disabled: boolean,
) {
  const [open, setOpen] = React.useState(false);
  const [customInstruction, setCustomInstruction] = React.useState('');
  const clickCount = React.useRef(0);
  const clickTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  useCleanupTimer(clickTimer);
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
  return {
    open, setOpen, customInstruction, setCustomInstruction, handleClick, handlePresetClick, handleCustomSubmit,
  };
}

export function AiAssistButton({
  presets,
  onGenerate,
  loading = false,
  disabled = false,
  className,
}: AiAssistButtonProps) {
  const {
    open,
    setOpen,
    customInstruction,
    setCustomInstruction,
    handleClick,
    handlePresetClick,
    handleCustomSubmit,
  } = useAiAssistState(presets, onGenerate, loading, disabled);

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
        <AiAssistPopoverContent
          presets={presets}
          customInstruction={customInstruction}
          setCustomInstruction={setCustomInstruction}
          handlePresetClick={handlePresetClick}
          handleCustomSubmit={handleCustomSubmit}
          loading={loading}
        />
      </PopoverContent>
    </Popover>
  );
}
