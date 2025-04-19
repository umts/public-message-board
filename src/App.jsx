import useGtfs from './hooks/useGtfs.js'
import useGtfsRealtime from './hooks/useGtfsRealtime.js'
import useDynamicHeight from './hooks/useDynamicHeight.js'

/**
 * Application entrypoint.
 *
 * @constructor
 * @return {JSX.Element}
 */
export default function App () {
  useDynamicHeight()
  const gtfs = useGtfs('http://localhost:9292/gtfs')
  const alerts = useGtfsRealtime('http://localhost:9292/gtfs-rt/trip-updates')
  return (
    <div>
      <h2>GTFS (routes.txt)</h2>
      <hr />
      <div><pre>{JSON.stringify(gtfs, null, 2)}</pre></div>
      <h2>GTFS Realtime Trip Updates</h2>
      <hr />
      <div><pre>{JSON.stringify(alerts, null, 2)}</pre></div>
    </div>
  )
}
