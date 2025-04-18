import PublicMessage from './components/PublicMessage.jsx'
import PublicMessageBoard from './components/PublicMessageBoard.jsx'
import useGtfs from './hooks/useGtfs'
import useDynamicHeight from './hooks/useDynamicHeight.js'

/**
 * Application entrypoint.
 *
 * @constructor
 * @return {JSX.Element}
 */
export default function App () {
  useDynamicHeight()
  const gtfs = useGtfs('https://bustracker.pvta.com/infopoint/GTFS-Realtime.ashx?Type=Alert')
  console.log(gtfs)
  return (<div><pre>{JSON.stringify(gtfs, null, 2)}</pre></div>)
}
