'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TeamRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/matchups')
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p className="text-[var(--text-secondary)] text-sm font-[family-name:var(--font-pixel)] tracking-wider">
        REDIRECTING...
      </p>
    </div>
  )
}
