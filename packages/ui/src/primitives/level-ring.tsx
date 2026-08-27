/**
 * SVG ring overlay showing an agent's XP level progress around an avatar.
 *
 * Lives in primitives/ — imports only from lib/ utilities.
 */

'use client';

import { cn } from '../utils';

interface LevelRingProps {
  /** Agent level (1-10) */
  level: number;
  /** XP progress within current level (0-1) */
  xpProgress: number;
  /** Size must match the avatar it wraps */
  size: number;
  children: React.ReactNode;
  className?: string;
}

function getRingStyle(level: number) {
  if (level <= 3) return { width: 2, colorClass: 'stroke-muted-foreground/50' };
  if (level <= 6) return { width: 2.5, colorClass: 'stroke-info' };
  if (level <= 8) return { width: 3, colorClass: 'stroke-warning' };
  return { width: 3.5, colorClass: 'stroke-chart-1' };
}

function getRingMetrics(level: number, xpProgress: number, size: number) {
  const clampedProgress = Math.max(0, Math.min(1, xpProgress));
  const ring = getRingStyle(level);
  const padding = ring.width + 2;
  const outerSize = size + padding * 2;
  const center = outerSize / 2;
  const radius = size / 2 + ring.width / 2 + 1;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - clampedProgress);
  return { ring, outerSize, center, radius, circumference, progressOffset };
}

function RingBackground({ center, radius, width }: { center: number; radius: number; width: number }) {
  return <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={width} className="stroke-muted/50" />;
}

function RingProgress({
  center,
  radius,
  width,
  colorClass,
  circumference,
  offset,
}: {
  center: number;
  radius: number;
  width: number;
  colorClass: string;
  circumference: number;
  offset: number;
}) {
  return (
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      strokeWidth={width}
      className={colorClass}
      strokeDasharray={circumference}
      strokeDashoffset={offset}
      strokeLinecap="round"
      style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
    />
  );
}

function RingShimmer({
  outerSize,
  center,
  radius,
  width,
  circumference,
}: {
  outerSize: number;
  center: number;
  radius: number;
  width: number;
  circumference: number;
}) {
  return (
    <svg
      width={outerSize}
      height={outerSize}
      className="absolute inset-0 animate-level-shimmer"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={width}
        className="stroke-chart-1/30"
        strokeDasharray={`${circumference * 0.15} ${circumference * 0.85}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LevelRing({ level, xpProgress, size, children, className }: LevelRingProps) {
  const { ring, outerSize, center, radius, circumference, progressOffset } = getRingMetrics(level, xpProgress, size);
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: outerSize, height: outerSize }}
    >
      <svg width={outerSize} height={outerSize} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <RingBackground center={center} radius={radius} width={ring.width} />
        <RingProgress
          center={center}
          radius={radius}
          width={ring.width}
          colorClass={ring.colorClass}
          circumference={circumference}
          offset={progressOffset}
        />
      </svg>
      {level >= 9 && (
        <RingShimmer
          outerSize={outerSize}
          center={center}
          radius={radius}
          width={ring.width}
          circumference={circumference}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
