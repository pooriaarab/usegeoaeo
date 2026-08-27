'use client';

import { cn } from '../utils';

type OverlaySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface StatusOverlayProps {
  status?: string;
  size?: OverlaySize;
  children: React.ReactNode;
  className?: string;
}

function getErrorSizeClass(size: OverlaySize) {
  if (size === 'xs') return '-top-0.5 -right-0.5 h-1.5 w-1.5';
  if (size === 'sm') return '-top-0.5 -right-0.5 h-2 w-2';
  if (size === 'xl') return '-top-0.5 -right-0.5 h-3.5 w-3.5';
  return '-top-0.5 -right-0.5 h-2.5 w-2.5';
}

function getBadgeSizeClass(size: OverlaySize) {
  if (size === 'sm') return '-bottom-0.5 -right-1 text-[6px] px-0.5 h-3';
  if (size === 'xl') return '-bottom-0.5 -right-2 text-[9px] px-1.5 h-4.5';
  return '-bottom-0.5 -right-1.5 text-[7px] px-1 h-3.5';
}

function ActiveRing() {
  return <div className="absolute inset-0 rounded-full ring-2 ring-success/40 animate-status-pulse" />;
}

function ErrorDot({ size }: { size: OverlaySize }) {
  return <div className={cn('absolute rounded-full bg-error animate-status-shake', getErrorSizeClass(size))} />;
}

function PausedBadge({ size }: { size: OverlaySize }) {
  return (
    <span
      className={cn(
        'absolute flex items-center justify-center rounded-full bg-warning/80 text-warning-foreground font-bold leading-none',
        getBadgeSizeClass(size),
      )}
    >
      zzz
    </span>
  );
}

function IdleBadge({ size }: { size: OverlaySize }) {
  return (
    <span
      className={cn(
        'absolute flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold leading-none',
        getBadgeSizeClass(size),
      )}
    >
      zzz
    </span>
  );
}

function StatusDecoration({ normalizedStatus, size }: { normalizedStatus: string; size: OverlaySize }) {
  if (normalizedStatus === 'active') return <ActiveRing />;
  if (normalizedStatus === 'error') return <ErrorDot size={size} />;
  if (normalizedStatus === 'paused' && size !== 'xs') return <PausedBadge size={size} />;
  if (normalizedStatus === 'idle' && size !== 'xs') return <IdleBadge size={size} />;
  return null;
}

export function StatusOverlay({ status, size = 'md', children, className }: StatusOverlayProps) {
  const normalizedStatus = status?.toLowerCase() ?? '';
  return (
    <div className={cn('relative inline-flex', className)}>
      <div className={cn(normalizedStatus === 'deleted' && 'opacity-40 grayscale')}>{children}</div>
      <StatusDecoration normalizedStatus={normalizedStatus} size={size} />
    </div>
  );
}
