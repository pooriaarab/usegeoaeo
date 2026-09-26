"use client";

import { Input } from "../primitives/input";
import { Button } from "../primitives/button";
export interface AiAssistPreset {
  label: string;
  value: string;
}

export function PresetList({
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

export function CustomInputRow({
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
          if (e.key === "Enter") {
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

export function AiAssistPopoverContent({
  presets,
  customInstruction,
  setCustomInstruction,
  handlePresetClick,
  handleCustomSubmit,
  loading,
}: {
  presets: AiAssistPreset[];
  customInstruction: string;
  setCustomInstruction: (v: string) => void;
  handlePresetClick: (v: string) => void;
  handleCustomSubmit: () => void;
  loading: boolean;
}) {
  return (
    <>
      <p className="text-xs font-medium text-muted-foreground">AI Assist</p>
      <PresetList presets={presets} onPresetClick={handlePresetClick} loading={loading} />
      <CustomInputRow
        value={customInstruction}
        onChange={setCustomInstruction}
        onSubmit={handleCustomSubmit}
        loading={loading}
      />
    </>
  );
}
