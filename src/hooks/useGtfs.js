import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { useEffect, useState } from 'react'

export default function useGtfs (url) {
  const [data, setData] = useState([])
  useEffect(() => {
    async function refresh () {
      const response = await fetch(url)
      const buffer = await response.arrayBuffer();
      const data = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))
      setData(data)
    }
    refresh()
    const interval = setInterval(refresh, 30 * 1000)
    return () => clearInterval(interval)
  }, [url])
  return data
}
