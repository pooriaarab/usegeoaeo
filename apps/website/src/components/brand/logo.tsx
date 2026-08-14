/**
 * The one geoaeo logo mark. Header and footer both render this so they can
 * never drift (they used to hand-roll separate "g" boxes at different sizes).
 * Size via className (defaults to size-7); the box style stays fixed.
 */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-lg bg-foreground text-sm font-bold leading-none text-background ${className}`}
    >
      g
    </span>
  );
}
