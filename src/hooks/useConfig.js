import { useEffect, useState } from 'react'

export function useConfig() {
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    fetch('config.json', { cache: 'no-cache' })
      .then(r => {
        if (!r.ok) throw new Error(`config.json ${r.status}`)
        return r.json()
      })
      .then(c => alive && setConfig(c))
      .catch(e => alive && setError(e))
    return () => {
      alive = false
    }
  }, [])

  return { config, error }
}
