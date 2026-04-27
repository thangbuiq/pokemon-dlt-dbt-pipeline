'use client'

import { useState } from 'react'

interface HowToGuideProps {
  title: string
  children: React.ReactNode
}

export function HowToGuide({ title, children }: HowToGuideProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <span
          className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: '#7AC74C', color: '#1a1a1a' }}
        >
          ?
        </span>
        <span className="text-[10px] font-[family-name:var(--font-pixel)] tracking-wider uppercase">
          How To
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 p-3 rounded-lg glass border border-[var(--card-border)] text-[11px] text-[var(--text-secondary)] leading-relaxed">
          <p className="font-[family-name:var(--font-pixel)] text-[10px] text-[var(--text-primary)] mb-1 tracking-wider">
            {title}
          </p>
          {children}
        </div>
      )}
    </div>
  )
}
