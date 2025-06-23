import PublicMessage from './components/PublicMessage.jsx'
import PublicMessageBoard from './components/PublicMessageBoard.jsx'
import useConfig from './hooks/useConfig.js'
import useDynamicHeight from './hooks/useDynamicHeight.js'
import useGtfsSchedule from './hooks/useGtfsSchedule.js'
import useGtfsRealtime from './hooks/useGtfsRealtime.js'
import usePublicMessages from './hooks/usePublicMessages.js'
import publicMessagesFromGtfs from './utils/publicMessagesFromGtfs.js'

/**
 * Application entrypoint.
 *
 * @constructor
 * @return {JSX.Element}
 */
export default function App () {
  useDynamicHeight()
  const { gtfsScheduleUrl, gtfsRealtimeUrl, infoPoint, routes } = useConfig()
  const gtfsSchedule = useGtfsSchedule(gtfsScheduleUrl)
  const gtfsRealtime = useGtfsRealtime(gtfsRealtimeUrl)
  const gtfsPublicMessages = publicMessagesFromGtfs(gtfsSchedule?.routes, gtfsRealtime?.entity, routes)
  const infoPointPublicMessages = usePublicMessages(infoPoint, routes)
  const publicMessages = (gtfsScheduleUrl && gtfsRealtimeUrl) ? gtfsPublicMessages : infoPointPublicMessages
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
