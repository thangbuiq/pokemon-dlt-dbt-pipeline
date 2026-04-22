import { type PokemonType, typeColorMap } from '@/lib/design-tokens'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  pokemonType?: PokemonType
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-surface-light text-white border-surface-light',
  secondary: 'bg-transparent text-white border-white/20',
  ghost: 'bg-transparent text-white/70 border-transparent',
}

export function Button({
  variant = 'primary',
  pokemonType,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const glowColor = pokemonType ? typeColorMap[pokemonType] : undefined

  const glowStyle = glowColor
    ? ({
        '--btn-glow': glowColor,
        borderColor: glowColor,
      } as React.CSSProperties)
    : undefined

  return (
    <button
      style={glowStyle}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold',
        'border transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        glowColor &&
          'hover:shadow-[0_0_15px_var(--btn-glow),0_0_30px_var(--btn-glow)] hover:border-[var(--btn-glow)]',
        !glowColor && 'hover:bg-white/10',
        'active:scale-95',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
