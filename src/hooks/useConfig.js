import { useMemo } from 'react'

/**
 * @typedef ConfigObject
 * @property {URL|null} gtfsScheduleRoutesUrl - a URL pointing to a remote gtfs feed routes.txt file.
 * @property {URL|null} gtfsRealtimeAlertsUrl - a URL pointing to a remote gtfs realtime alerts feed.
 * @property {[String]|null} routes - a list of route abbreviations to be used as a whitelist.
 */

/**
 * Hook responsible for parsing application configuration options from the window location's current search query.
 *
 * - `gtfsScheduleRoutesUrl` optionally parses a fully qualified url in the search params.
 * - `gtfsScheduleRoutesUrl` will be `null` if a parsing error occurs or no url is passed.
 * - `gtfsRealtimeAlertsUrl` optionally parses a fully qualified url in the search params.
 * - `gtfsRealtimeAlertsUrl` will be `null` if a parsing error occurs or no url is passed.
 * - `routes` optionally parses a comma-separated list of route abbreviations in the search params.
 * - `routes` will have blank values filtered out.
 * - `routes` will default to `null` if no option is provided.
 *
 * @example
 * // https://example.com/?gtfsScheduleRoutesUrl=https://example.com/gtfs/schedule/routes&gtfsRealtimeAlertsUrl=https://example.com/gtfs/alerts/v2&routes=A1,B2
 * // results in {gtfsScheduleRoutesUrl: URL(https://example.com/gtfs/schedule/routes), gtfsRealtimeAlertsUrl: URL(https://example.com/gtfs/alerts/v2) routes: ['A1', 'B2']}
 *
 * @example
 * // https://example.com/?gtfsSchduleUrl=badurl&routes=
 * // results in {gtfsScheduleRoutesUrl: null, gtfsRealtimeAlertsUrl: null, routes: []}
 *
 * @return {ConfigObject}
 */
export default function useConfig () {
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return {
      gtfsScheduleRoutesUrl: parseUrl(searchParams.get('gtfsScheduleCsvUrl')) || DEFAULT_GTFS_ROUTE_URL,
      gtfsRealtimeAlertsUrl: parseUrl(searchParams.get('gtfsRealtimeAlertsUrl')) || DEFAULT_GTFS_REALTIME_ALERTS_URL,
      routes: parseRoutes(searchParams.get('routes')),
    }
  }, [])
}

const DEFAULT_GTFS_ROUTE_URL = new URL('https://gtfs-cache.admin.umass.edu/gtfs/routes')
const DEFAULT_GTFS_REALTIME_ALERTS_URL = new URL('https://gtfs-cache.admin.umass.edu/gtfs-rt/alerts')

/**
 * Parses a URL, returning null if a parsing error occurs.
 *
 * @param {String|null} arg - a user provided configuration option.
 * @return {URL|null} the parsed URL.
 * @see {useConfig}
 */
function parseUrl (arg) {
  try {
    return new URL(arg)
  } catch {
    return null
  }
}

/**
 * Parses a list of comma-separated route abbreviations.
 *
 * @param {String|null} arg - a user provided configuration option.
 * @return {[String]|null} - the parsed list of routes.
 * @see {useConfig}
 */
function parseRoutes (arg) {
  return arg?.split(',')?.filter((route) => !!(route)) || null
}
