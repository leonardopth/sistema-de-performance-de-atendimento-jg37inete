import { useState, useEffect, useCallback, type DependencyList } from 'react'

interface AsyncDataState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  reload: () => void
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList = [],
): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    loader()
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loader()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, reload }
}
