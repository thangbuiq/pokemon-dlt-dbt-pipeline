interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export function LoadingSpinner({ size = 48, className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="animate-[spin-pokeball_1s_linear_infinite]"
      >
        <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#1a1a2e" strokeWidth="4" />
        <rect x="0" y="46" width="100" height="8" fill="#1a1a2e" />
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
          clipPath="inset(0 0 50% 0)"
        />
        <circle cx="50" cy="50" r="12" fill="#1a1a2e" stroke="#ffffff" strokeWidth="4" />
        <circle cx="50" cy="50" r="6" fill="#ffffff" />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
