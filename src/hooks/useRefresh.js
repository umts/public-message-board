import { useEffect, useState } from 'react'

export default function useRefresh (fetcher, timeout) {
  const [data, setData] = useState()
  useEffect(() => {
    async function refresh () {
      try {
        setData(await fetcher())
      } catch {
        setData(null)
      }
    }
    refresh()
    const interval = setInterval(refresh, timeout)
    return () => clearInterval(interval)
  }, [fetcher, timeout])
  return data
}
