import { useCallback, useEffect, useRef, useState } from "react"
import { accountError } from "@/dataset_services/accountApi"

export function useAccountQuery<T>(load: () => Promise<T> | null) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const generation = useRef(0)
  const inFlight = useRef(false)
  const loadData = useCallback(async (background: boolean) => {
    if (background && inFlight.current) return
    const request = ++generation.current
    const pending = load()
    if (pending === null) {
      inFlight.current = false
      setData(undefined)
      setLoading(false)
      return
    }
    inFlight.current = true
    if (!background) {
      setLoading(true)
      setError("")
    }
    try {
      const result = await pending
      if (request === generation.current) {
        setData(result)
        setError("")
      }
    } catch (error) {
      if (request === generation.current && !background) setError(accountError(error))
    } finally {
      if (request === generation.current) {
        inFlight.current = false
        setLoading(false)
      }
    }
  }, [load])

  const refresh = useCallback(() => loadData(false), [loadData])
  const refreshInBackground = useCallback(() => loadData(true), [loadData])

  useEffect(() => {
    setData(undefined)
    void refresh()
    return () => {
      generation.current += 1
      inFlight.current = false
    }
  }, [refresh])
  return { data, setData, error, loading, refresh, refreshInBackground }
}
