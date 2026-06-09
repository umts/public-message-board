import PublicMessage from "./components/PublicMessage.jsx";
import PublicMessageBoard from "./components/PublicMessageBoard.jsx";
import useConfig from "./hooks/useConfig.js";
import useDynamicHeight from "./hooks/useDynamicHeight.js";
import { useGtfsRealtime, useGtfsScheduleCsv } from "gtfs-react-hooks";
import publicMessagesFromGtfs from "./utils/publicMessagesFromGtfs.js";
import useScheduleRouteResolver from "./hooks/useScheduleRouteResolver.js";
import useRealtimeAlertsResolver from "./hooks/useRealtimeAlertsResolver.js";

/**
 * Application entrypoint.
 *
 * @constructor
 * @return {JSX.Element}
 */
export default function App() {
  useDynamicHeight();
  const { gtfsScheduleRoutesUrl, gtfsRealtimeAlertsUrl, routesFilter } = useConfig();

  const fetchGtfsRoutes = useScheduleRouteResolver(gtfsScheduleRoutesUrl);
  const gtfsRoutes = useGtfsScheduleCsv(fetchGtfsRoutes, 24 * 60 * 60 * 1000);

  const fetchGtfsRealtime = useRealtimeAlertsResolver(gtfsRealtimeAlertsUrl);
  const gtfsRealtimeAlerts = useGtfsRealtime(fetchGtfsRealtime, 30 * 1000);

  const publicMessages = publicMessagesFromGtfs(
    gtfsRoutes,
    gtfsRealtimeAlerts?.entity,
    routesFilter,
  );

  return (
    <PublicMessageBoard>
      {publicMessages === undefined ? null : publicMessages === null ? (
        <PublicMessage description="Failed to load message information." />
      ) : publicMessages.length === 0 ? (
        <PublicMessage description="There are no detours currently in effect." />
      ) : (
        publicMessages.map(({ id, routes, ...message }) => (
          <PublicMessage key={id} routes={routes.length > 0 ? routes : allRoutes} {...message} />
        ))
      )}
    </PublicMessageBoard>
  );
}

const allRoutes = [{ id: "all", abbreviation: "ALL" }];
