'use client'

import { useState, useEffect, useCallback } from 'react'

export function useJSONQuery<T>(jsonFile: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/data/${jsonFile}`)
      if (!response.ok) {
        throw new Error(`Failed to load ${jsonFile}: ${response.status}`)
      }
      const json = await response.json()
      setData(json as T[])
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [jsonFile])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
