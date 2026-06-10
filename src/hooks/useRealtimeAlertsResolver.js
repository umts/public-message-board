/* istanbul ignore file */

import { useFetchResolver } from "gtfs-react-hooks";

export default function useRealtimeAlertsResolver(url) {
  return useFetchResolver(url);
}
