import JSZip from 'jszip'
import { useCallback } from 'react'
import useRefresh from './useRefresh.js'

export default function useGtfs (url) {
  const fetchGtfs = useCallback(async () => {
    if (!(url)) return null
    const response = await fetch(url)
    const responseBuffer = await response.arrayBuffer()
    return await JSZip.loadAsync(responseBuffer)
  }, [url])
  return useRefresh(fetchGtfs, 24 * 60 * 60 * 1000)
}
