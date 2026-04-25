import { type PokemonType, typeColorMap } from '@/lib/design-tokens'

interface BadgeProps {
  type: PokemonType
  label?: string
  className?: string
}

export function Badge({ type, label, className = '' }: BadgeProps) {
  const color = typeColorMap[type]
  const displayLabel = label ?? type.charAt(0).toUpperCase() + type.slice(1)

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-[family-name:var(--font-pixel)] uppercase tracking-wider transition-all duration-200',
        'hover:scale-110 hover:shadow-lg hover:brightness-125',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        backgroundColor: color,
        color: '#ffffff',
        boxShadow: `0 0 6px ${color}60`,
        border: `1px solid ${color}`,
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
      }}
    >
      {displayLabel}
    </span>
  )
}
