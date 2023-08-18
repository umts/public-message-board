import {useCallback, useEffect, useMemo, useState} from 'react';

/**
 * @typedef PublicMessageObject
 * @property {Number} key - a unique key for the message, determined by the message ID from InfoPoint
 * @property {String} message - the text for a public message.
 * @property {Array} routes - list of routes affected by this message.
 * @property {String|null} route.abbreviation - a short name for a route if applicable, null if the message is general.
 * @property {String|null} route.color - a color (hex string but without #) override for a route's background if
 *                                      applicable, null if the message is general.
 * @property {String|null} route.textColor - a color (hex string but without #) override for a route's text if
 *                                          applicable, null if the message is general.
 * @property {Number|null} route.sortOrder - a pre-set sort order for the route if applicable.
 * @property {Number|null} sortOrder - a pre-set sort order determined by the routes, if they exist.
 */

/**
 * Hook responsible for fetching, storing, maintaining and processing public message data from a remote Avail InfoPoint
 * API endpoint.
 *
 * - Will return `undefined` if data has not yet been fetched yet.
 * - Will return `null` if an error occurs during fetching.
 * - Will re-fetch and re-process data periodically.
 * - Will sort public messages with general (route-less) messages first, then by the API given route sort order,
 *   then lexically by message.
 * - Will apply filtering by route abbreviation if provided, always letting general message through.
 * - Will give general messages a fake route abbreviation.
 *
 * @param {URL} infoPoint - the URL of the InfoPoint API from which to get public message data.
 * @param {[String]|null} routes - a list of route abbreviations to whitelist, null if no filtering is to be applied.
 * @return {[PublicMessageObject]|null|undefined}
 */
export default function usePublicMessages(infoPoint, routes) {
  const [publicMessages, setPublicMessages] = useState(undefined);

  const refreshPublicMessages = useCallback(() => {
    fetchPublicMessages(infoPoint).then((publicMessages) => {
      setPublicMessages(publicMessages);
    }).catch(() => {
      setPublicMessages(null);
    });
  }, [infoPoint, setPublicMessages]);

  useEffect(() => {
    refreshPublicMessages();
    const interval = setInterval(refreshPublicMessages, 30 * 1000);
    return () => clearInterval(interval);
  }, [refreshPublicMessages]);

  return useMemo(() => {
    if (!(publicMessages instanceof Array)) return publicMessages;
    return publicMessages.sort(comparePublicMessages).filter((publicMessage) => {
      if (routes instanceof Array) {
        return (publicMessage.routes.filter((route) => {
          return routes.includes(route.abbreviation);
        }).length > 0);
      } else {
        return true;
      }
    });
  }, [routes, publicMessages]);
}

/**
 * Fetches public message data from an Avail InfoPoint API.
 *
 * @param {URL} infoPoint
 * @return {Promise<[PublicMessageObject]>}
 * @see {usePublicMessages}
 */
async function fetchPublicMessages(infoPoint) {
  const routesById = {};
  const getAllRoutesResponse = await fetch(new URL('Routes/GetAllRoutes', infoPoint));
  const getAllRoutesJSON = await getAllRoutesResponse.json();
  getAllRoutesJSON.forEach((route) => {
    routesById[route['RouteId']] = route;
  });

  const publicMessages = [];
  const getCurrentMessagesResponse = await fetch(new URL('PublicMessages/GetCurrentMessages', infoPoint));
  const getCurrentMessagesJSON = await getCurrentMessagesResponse.json();
  getCurrentMessagesJSON.forEach((publicMessage) => {
    let sortOrder;
    const routes = [];
    publicMessage['Routes'].forEach((routeId) => {
      routes.push({
        id: routeId,
        abbreviation: routesById[routeId]['RouteAbbreviation'] || null,
        color: routesById[routeId]['Color'] || null,
        textColor: routesById[routeId]['TextColor'] || null,
        sortOrder: routesById[routeId]['SortOrder'] || null,
      });
      if (routesById[routeId]['SortOrder'] && routesById[routeId]['SortOrder'] < sortOrder) {
        sortOrder = routesById[routeId]['SortOrder'];
      }
    });
    publicMessages.push({
      key: publicMessage['MessageId'],
      message: publicMessage['Message'],
      routes: routes.sort(compareRoutes) || 'ALL',
      sortOrder: sortOrder,
    });
  });
  return publicMessages;
}

/** Compares two public messages for sorting purposes.
 *
 * @param {PublicMessageObject} publicMessage1
 * @param {PublicMessageObject} publicMessage2
 * @return {Number}
 * @see {usePublicMessages}
 */
function comparePublicMessages(publicMessage1, publicMessage2) {
  const [order1, order2] = [publicMessage1.sortOrder, publicMessage2.sortOrder];
  if (order1 === null && order2 !== null) {
    return -1;
  } else if (order1 !== null && order2 === null) {
    return 1;
  } else if (order1 !== null && order2 !== null && order1 !== order2) {
    return order1 - order2;
  } else {
    return publicMessage1.message.localeCompare(publicMessage2.message);
  }
}

/** Compares two routes for sorting purposes.
 *
 * @param {Object} route1
 * @param {Object} route2
 * @return {Number}
 * @see {fetchPublicMessages}
 */
function compareRoutes(route1, route2) {
  const [order1, order2] = [route1.sortOrder, route2.sortOrder];
  if (order1 === null && order2 !== null) {
    return -1;
  } else if (order1 !== null && order2 === null) {
    return 1;
  } else if (order1 !== null && order2 !== null && order1 !== order2) {
    return order1 - order2;
  } else {
    return route1.abbreviation.localeCompare(route2.abbreviation);
  }
}
