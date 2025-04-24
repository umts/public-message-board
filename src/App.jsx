import PublicMessage from './components/PublicMessage.jsx'
import PublicMessageBoard from './components/PublicMessageBoard.jsx'
import useConfig from './hooks/useConfig.js'
import useDynamicHeight from './hooks/useDynamicHeight.js'
import useGtfs from './hooks/useGtfs.js'
import useGtfsRealtime from './hooks/useGtfsRealtime.js'
import useInfoPointAlerts from './hooks/useInfoPointAlerts.js'
import useInfoPointRoutes from './hooks/useInfoPointRoutes.js'
import publicMessagesFromGtfs from './utils/publicMessagesFromGtfs.js'

/**
 * Application entrypoint.
 *
 * @constructor
 * @return {JSX.Element}
 */
export default function App () {
  useDynamicHeight()
  const { gtfs, gtfsRealtimeAlerts, infoPoint, routes } = useConfig()

  const gtfsRoutes = useGtfs(gtfs)?.routes
  const gtfsAlerts = useGtfsRealtime(gtfsRealtimeAlerts)?.entity
  const infoPointRoutes = useInfoPointRoutes(infoPoint)
  const infoPointAlerts = useInfoPointAlerts(infoPoint)

  const routeData = (gtfs) ? gtfsRoutes : infoPointRoutes
  const alertData = (gtfsRealtimeAlerts) ? gtfsAlerts : infoPointAlerts

  const publicMessages = publicMessagesFromGtfs(routeData, alertData, routes)

  return (
    <>
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
      <pre>{JSON.stringify(routeData, null, 2)}</pre>
      <hr />
      <pre>{JSON.stringify(alertData, null, 2)}</pre>
    </>
  )
}
