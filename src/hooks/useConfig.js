import {useMemo} from 'react';

/**
 * Parses an application configuration from URLSearchParams.
 *
 * @return {{}}
 */
export default function useConfig() {
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      infoPoint: parseInfoPoint(searchParams.get('infoPoint')),
      routes: parseRoutes(searchParams.get('routes')),
    };
  }, []);
}

/**
 * Parses an InfoPoint rest API URL.
 *
 * @param {null|String} arg
 * @return {null|URL}
 */
function parseInfoPoint(arg) {
  arg ??= 'https://bustracker.pvta.com/InfoPoint/rest/';
  try {
    const url = new URL(arg);
    if (!(url.pathname.endsWith('/'))) url.pathname = `${url.pathname}/`;
    return url;
  } catch {
    return null;
  }
}

/**
 * Parses a list of route abbreviations.
 *
 * @param {null|String} arg
 * @return {null|[String]}
 */
function parseRoutes(arg) {
  return arg?.split(',')?.filter((route) => !!(route)) || null;
}
