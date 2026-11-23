import { useCallback, useEffect, useRef, useState } from "react"
import { accountError } from "@/dataset_services/accountApi"

export function useAccountQuery<T>(load: () => Promise<T> | null) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const generation = useRef(0)
  const refresh = useCallback(async () => {
    const request = ++generation.current
    const pending = load()
    if (pending === null) {
      setData(undefined)
      setLoading(false)
      return
    }
    setLoading(true)
    setError("")
    try {
      const result = await pending
      if (request === generation.current) setData(result)
    } catch (error) {
      if (request === generation.current) setError(accountError(error))
    } finally {
      if (request === generation.current) setLoading(false)
    }
  }, [load])

  useEffect(() => {
    setData(undefined)
    void refresh()
    return () => { generation.current += 1 }
  }, [refresh])
  return { data, setData, error, loading, refresh }
}
