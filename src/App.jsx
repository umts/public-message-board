import PublicMessage from "./components/PublicMessage.jsx";
import PublicMessageBoard from "./components/PublicMessageBoard.jsx";
import useConfig from "./hooks/useConfig.js";
import useDynamicHeight from "./hooks/useDynamicHeight.js";
import useGtfsScheduleRoutes from "./hooks/useGtfsScheduleRoutes.js";
import useGtfsRealtimeAlerts from "./hooks/useGtfsRealtimeAlerts.js";
import publicMessagesFromGtfs from "./utils/publicMessagesFromGtfs.js";

/**
 * Application entrypoint.
 *
 * @constructor
 * @return {JSX.Element}
 */
export default function App() {
  useDynamicHeight();
  const { gtfsScheduleRoutesUrl, gtfsRealtimeAlertsUrl, routesFilter } = useConfig();

  const gtfsRoutes = useGtfsScheduleRoutes(gtfsScheduleRoutesUrl);
  const gtfsRealtimeAlerts = useGtfsRealtimeAlerts(gtfsRealtimeAlertsUrl);

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
