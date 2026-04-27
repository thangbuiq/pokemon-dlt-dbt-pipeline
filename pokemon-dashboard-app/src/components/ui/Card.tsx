import { type PokemonType } from '@/lib/design-tokens'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  pokemonType?: PokemonType
  className?: string
  hover?: boolean
}

export function Card({
  children,
  pokemonType,
  className = '',
  hover = false,
  ...props
}: CardProps) {
  const glowStyle = pokemonType
    ? ({ '--glow-color': `var(--type-${pokemonType})` } as React.CSSProperties)
    : undefined

  return (
    <div
      style={glowStyle}
      className={[
        'glass rounded-xl p-4',
        hover && 'glass-hover transition-all duration-300 cursor-pointer',
        pokemonType && 'hover:shadow-[0_0_20px_var(--glow-color)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
