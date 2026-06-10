/* istanbul ignore file */

import { useFetchResolver, useGtfsScheduleCsv } from "gtfs-react-hooks";

export default function useGtfsRealtimeAlerts(url) {
  return useGtfsScheduleCsv(useFetchResolver(url), 24 * 60 * 60 * 1000);
}
