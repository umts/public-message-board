import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { useCallback } from 'react'
import useRefresh from './useRefresh.js'

export default function useGtfsRealtime (url) {
  const fetchGtfsRealtime = useCallback(async () => {
    if (!(url)) return null
    const response = await fetch(url)
    const responseBuffer = await response.arrayBuffer()
    return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(responseBuffer))
  }, [url])
  return useRefresh(fetchGtfsRealtime, 30 * 1000)
}
