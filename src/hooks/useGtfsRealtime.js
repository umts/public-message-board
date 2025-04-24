import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { useCallback } from 'react'
import useRefresh from './useRefresh.js'

export default function useGtfsRealtime (url) {
  const fetchGtfsRealtime = useCallback(async () => {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))
  }, [url])
  return useRefresh(fetchGtfsRealtime, 30 * 1000)
}
