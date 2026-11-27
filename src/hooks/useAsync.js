import { useEffect, useState } from 'react'

// Runs an async loader and tracks loading / error. Pass a stable loader (useCallback);
// it re-runs whenever the loader changes or reload() is called. Old data stays visible while reloading.
export function useAsync(load) {
  const [reloads, setReloads] = useState(0)
  const [state, setState] = useState({ load: null, reloads: -1, data: undefined, error: null })

  useEffect(() => {
    let live = true
    load().then(
      (data) => { if (live) setState({ load, reloads, data, error: null }) },
      (error) => { if (live) setState({ load, reloads, data: undefined, error }) },
    )
    return () => { live = false }
  }, [load, reloads])

  const loading = state.load !== load || state.reloads !== reloads
  return { data: state.data, error: loading ? null : state.error, loading, reload: () => setReloads((n) => n + 1) }
}
