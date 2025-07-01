import { useMemo } from 'react'

/**
 * @typedef ConfigObject
 * @property {URL|null} gtfsScheduleUrl - a URL pointing to a remote gtfs feed zip file.
 * @property {URL|null} gtfsRealtimeAlertsUrl - a URL pointing to a remote gtfs realtime alerts feed.
 * @property {[String]|null} routes - a list of route abbreviations to be used as a whitelist.
 */

/**
 * Hook responsible for parsing application configuration options from the window location's current search query.
 *
 * - `gtfsScheduleUrl` optionally parses a fully qualified url in the search params.
 * - `gtfsScheduleUrl` will be `null` if a parsing error occurs or no url is passed.
 * - `gtfsRealtimeAlertsUrl` optionally parses a fully qualified url in the search params.
 * - `gtfsRealtimeAlertsUrl` will be `null` if a parsing error occurs or no url is passed.
 * - `routes` optionally parses a comma-separated list of route abbreviations in the search params.
 * - `routes` will have blank values filtered out.
 * - `routes` will default to `null` if no option is provided.
 *
 * @example
 * // https://example.com/?gtfsScheduleUrl=https://example.com/gtfs/schedule&gtfsRealtimeAlertsUrl=https://example.com/gtfs/alerts/v2&routes=A1,B2
 * // results in {gtfsScheduleUrl: URL(https://example.com/gtfs/schedule), gtfsRealtimeAlertsUrl: URL(https://example.com/gtfs/alerts/v2) routes: ['A1', 'B2']}
 *
 * @example
 * // https://example.com/?gtfsSchduleUrl=badurl&routes=
 * // results in {gtfsScheduleUrl: null, gtfsRealtimeAlertsUrl: null, routes: []}
 *
 * @return {ConfigObject}
 */
export default function useConfig () {
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return {
      gtfsScheduleUrl: parseUrl(searchParams.get('gtfsScheduleUrl')),
      gtfsRealtimeAlertsUrl: parseUrl(searchParams.get('gtfsRealtimeAlertsUrl')),
      routes: parseRoutes(searchParams.get('routes')),
    }
  }, [])
}

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
