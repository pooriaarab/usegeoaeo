'use client';

import { cn } from '../utils';
import { CATEGORY_LABELS } from './mention-helpers';
import type { MentionCategory, MentionEntity } from './mention-textarea';

function DefaultEntityIcon({ entity, size }: { entity: MentionEntity; size: 'sm' | 'md' }) {
  const px = size === 'sm' ? 14 : 18;
  if (entity.avatarUrl)
    return (
      <img
        src={entity.avatarUrl}
        alt=""
        width={px}
        height={px}
        className="rounded-full object-cover shrink-0"
        style={{ width: px, height: px }}
      />
    );
  if (entity.emoji) return <span className="shrink-0 leading-none">{entity.emoji}</span>;
  const initial = entity.displayName?.charAt(0).toUpperCase() ?? '?';
  return (
    <span
      className={cn(
        'shrink-0 rounded-full flex items-center justify-center',
        'text-white font-medium',
        entity.avatarColor || 'bg-muted-foreground/50',
      )}
      style={{ width: px, height: px, fontSize: px * 0.55 }}
    >
      {initial}
    </span>
  );
}

function MentionOption({
  entity,
  idx,
  selectedIndex,
  onSelect,
  renderEntityIcon,
}: {
  entity: MentionEntity;
  idx: number;
  selectedIndex: number;
  onSelect: (e: MentionEntity) => void;
  renderEntityIcon?: (entity: MentionEntity, size: 'sm' | 'md') => React.ReactNode;
}) {
  const optionId = `mention-option-${entity.category}-${entity.id}`;
  const isSelected = idx === selectedIndex;
  return (
    <button
      key={`${entity.category}:${entity.id}`}
      id={optionId}
      type="button"
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2',
        'text-sm text-left hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted',
      )}
      onMouseDown={(ev) => {
        ev.preventDefault();
        onSelect(entity);
      }}
    >
      {renderEntityIcon ? (
        renderEntityIcon(entity, 'md')
      ) : (
        <DefaultEntityIcon entity={entity} size="md" />
      )}
      <span className="font-medium truncate">{entity.displayName}</span>
      <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{entity.name}</span>
    </button>
  );
}

function MentionGroup({
  group,
  startIndex,
  selectedIndex,
  onSelect,
  renderEntityIcon,
}: {
  group: { category: MentionCategory; items: MentionEntity[] };
  startIndex: number;
  selectedIndex: number;
  onSelect: (e: MentionEntity) => void;
  renderEntityIcon?: (entity: MentionEntity, size: 'sm' | 'md') => React.ReactNode;
}) {
  return (
    <div key={group.category}>
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
        {CATEGORY_LABELS[group.category]}
      </div>
      {group.items.map((entity, i) => (
        <MentionOption
          key={`${entity.category}:${entity.id}`}
          entity={entity}
          idx={startIndex + i}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          renderEntityIcon={renderEntityIcon}
        />
      ))}
    </div>
  );
}

export function MentionDropdown({
  grouped,
  selectedIndex,
  onSelect,
  renderEntityIcon,
  dropdownRef,
}: {
  grouped: { category: MentionCategory; items: MentionEntity[] }[];
  selectedIndex: number;
  onSelect: (e: MentionEntity) => void;
  renderEntityIcon?: (entity: MentionEntity, size: 'sm' | 'md') => React.ReactNode;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  let flatIndex = 0;
  return (
    <div
      ref={dropdownRef}
      id="mention-listbox"
      role="listbox"
      aria-label="Mention suggestions"
      className={
        "absolute top-full left-0 right-0 mt-1 bg-popover border " +
        "border-border rounded-xl shadow-lg overflow-hidden z-10 " +
        "max-h-[240px] overflow-y-auto"
      }
    >
      {grouped.map((group) => {
        const start = flatIndex;
        flatIndex += group.items.length;
        return (
          <MentionGroup
            key={group.category}
            group={group}
            startIndex={start}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
            renderEntityIcon={renderEntityIcon}
          />
        );
      })}
    </div>
  );
}
