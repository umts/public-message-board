import { useMemo } from 'react'

/**
 * @typedef ConfigObject
 * @property {URL|null} gtfsScheduleUrl - a URL pointing to a remote gtfs feed zip file.
 * @property {URL|null} gtfsRealtimeAlertsUrl - a URL pointing to a remote gtfs realtime alerts feed.
 * @property {URL|null} infoPoint - a URL pointing to a remote Avail InfoPoint rest API.
 * @property {[String]|null} routes - a list of route abbreviations to be used as a whitelist.
 */

/**
 * Hook responsible for parsing application configuration options from the window location's current search query.
 *
 * - `gtfsScheduleUrl` optionally parses a fully qualified url in the search params.
 * - `gtfsScheduleUrl` will be `null` if a parsing error occurs.
 * - `gtfsRealtimeAlertsUrl` optionally parses a fully qualified url in the search params.
 * - `gtfsRealtimeAlertsUrl` will be `null` if a parsing error occurs.
 * - `infoPoint` optionally parses a fully qualified url in the search params.
 * - `infoPoint` will have a trailing / appended if it is not present.
 * - `infoPoint` will default to the PVTA InfoPoint installation if none is provided.
 * - `infoPoint` will be `null` if a parsing error occurs.
 * - `routes` optionally parses a comma-separated list of route abbreviations in the search params.
 * - `routes` will have blank values filtered out.
 * - `routes` will default to `null` if no option is provided.
 *
 * @example
 * // https://example.com/?infoPoint=https://example.com/InfoPoint/rest&routes=A1,B2
 * // results in {infoPoint: URL(https://example.com/InfoPoint/rest/), routes: ['A1', 'B2']}
 *
 * @example
 * // https://example.com/
 * // results in {infoPoint: URL(https://bustracker.pvta.com/InfoPoint/rest/), routes: null}
 *
 * @example
 * // https://example.com/?infoPoint=badurl&routes=
 * // results in {infoPoint: null, routes: []}
 *
 * @return {ConfigObject}
 */
export default function useConfig () {
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return {
      gtfsScheduleUrl: parseUrl(searchParams.get('gtfsScheduleUrl')),
      gtfsRealtimeAlertsUrl: parseUrl(searchParams.get('gtfsRealtimeAlertsUrl')),
      infoPoint: parseInfoPoint(searchParams.get('infoPoint')),
      routes: parseRoutes(searchParams.get('routes')),
    }
  }, [])
}

/**
 * Parses a URL pointing to a remote Avail InfoPoint rest API.
 *
 * @param {String|null} arg - a user provided configuration option.
 * @return {URL|null} - the parsed URL.
 * @see {useConfig}
 */
function parseInfoPoint (arg) {
  arg ??= 'https://bustracker.pvta.com/InfoPoint/rest/'
  const url = parseUrl(arg)
  if (url !== null && !(url.pathname.endsWith('/'))) url.pathname = `${url.pathname}/`
  return url
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
