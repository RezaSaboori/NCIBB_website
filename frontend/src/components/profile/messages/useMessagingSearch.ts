import { useCallback, useEffect, useState } from "react"
import type { RemoteDropdownSearch } from "@/components/ui/inputs/DropdownInput"
import { accountError } from "@/dataset_services/accountApi"
import { useAccountQuery } from "../shared/useAccountQuery"

export function useMessagingSearch<T>(enabled: boolean, label: string, load: (term: string) => Promise<T[]>) {
  const [value, setValue] = useState("")
  const [debounced, setDebounced] = useState("")
  const term = value.trim().slice(0, 120)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(term), term ? 250 : 0)
    return () => window.clearTimeout(timer)
  }, [term])

  const query = useAccountQuery(useCallback(() => enabled ? load(debounced).then(
    (options) => ({ term: debounced, options, error: "" }),
    (error: unknown) => ({ term: debounced, options: [], error: accountError(error) }),
  ) : null, [enabled, debounced, load]))
  const current = !query.loading && term === debounced && query.data?.term === term ? query.data : undefined

  const remoteSearch: RemoteDropdownSearch = {
    label, value, onChange: setValue, loading: enabled && !current, error: current?.error, retry: query.refresh,
  }
  return { options: current?.options ?? [], remoteSearch }
}
