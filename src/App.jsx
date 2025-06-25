import PublicMessage from './components/PublicMessage.jsx'
import PublicMessageBoard from './components/PublicMessageBoard.jsx'
import useConfig from './hooks/useConfig.js'
import useDynamicHeight from './hooks/useDynamicHeight.js'
import { useGtfsSchedule, useGtfsRealtime } from 'gtfs-react-hooks'
import { useCallback } from 'react'
import publicMessagesFromGtfs from './utils/publicMessagesFromGtfs.js'

/**
 * Application entrypoint.
 *
 * @constructor
 * @return {JSX.Element}
 */
export default function App () {
  useDynamicHeight()
  const { gtfsScheduleUrl, gtfsRealtimeAlertsUrl, routes } = useConfig()

  const fetchGtfsSchedule = useCallback(async () => {
    const response = await fetch(gtfsScheduleUrl)
    return new Uint8Array(await response.arrayBuffer())
  }, [])
  const gtfsSchedule = useGtfsSchedule(fetchGtfsSchedule, 24 * 60 * 60 * 1000)

  const fetchGtfsRealtime = useCallback(async () => {
    const response = await fetch(gtfsRealtimeAlertsUrl)
    return new Uint8Array(await response.arrayBuffer())
  }, [])
  const gtfsRealtimeAlerts = useGtfsRealtime(fetchGtfsRealtime, 30 * 1000)

  const publicMessages = publicMessagesFromGtfs(gtfsSchedule?.routes, gtfsRealtimeAlerts?.entity, routes)

  return (
    <PublicMessageBoard>
      {(publicMessages === undefined)
        ? (<></>)
        : (publicMessages === null)
            ? (<PublicMessage message='Failed to load message information.' />)
            : (publicMessages.length === 0)
                ? (<PublicMessage message='There are no detours currently in effect.' />)
                : publicMessages.map(({ id, routes, ...message }) => (
                  <PublicMessage
                    key={id}
                    routes={(routes.length > 0) ? routes : [{ id, abbreviation: 'ALL' }]}
                    {...message}
                  />
                ))}
    </PublicMessageBoard>
  )
}
