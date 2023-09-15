import {useCallback, useEffect, useMemo, useState} from 'react';

/**
 * @typedef PublicMessageObject
 * @property {Number} id - a unique id for the message, from InfoPoint
 * @property {String} message - the text for a public message.
 * @property {[RouteObject]|null} routes - list of routes affected by this message, null if message is general.
 * @property {Number|null} sortOrder - a pre-set sort order determined by the routes, if applicable.
 */

/**
 * @typedef RouteObject
 * @property {Number} id - a unique id for the route, from InfoPoint
 * @property {String} abbreviation - a short name for a route.
 * @property {String|null} color - a color (hex string but without #) override for a route's background, if applicable.
 * @property {String|null} textColor - a color (hex string but without #) override for a route's text, if applicable.
 * @property {Number|null} sortOrder - a pre-set sort order for the route, if applicable.
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
    return publicMessages.filter((publicMessage) => {
      if (routes instanceof Array) {
        return publicMessage.routes.some((route) => routes.includes(route.abbreviation));
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
    let routes;
    if (publicMessage['Routes'] && publicMessage['Routes'].length > 0) {
      routes = publicMessage['Routes'].map((routeId) => {
        if (
          typeof(routesById[routeId]['SortOrder']) === 'number' &&
          (typeof(sortOrder) !== 'number' || routesById[routeId]['SortOrder'] < sortOrder)
        ) {
          sortOrder = routesById[routeId]['SortOrder'];
        }
        return {
          id: routeId,
          abbreviation: routesById[routeId]['RouteAbbreviation'],
          color: routesById[routeId]['Color'] || null,
          textColor: routesById[routeId]['TextColor'] || null,
          sortOrder: routesById[routeId]['SortOrder'] || null,
        };
      }).sort(compareRoutes);
    }
    publicMessages.push({
      id: publicMessage['MessageId'],
      message: publicMessage['Message'],
      priority: publicMessage['Priority'],
      routes: routes || null,
      sortOrder: sortOrder || null,
    });
  });
  return publicMessages.sort(comparePublicMessages);
}

/** Compares two public messages for sorting purposes.
 *
 * @param {PublicMessageObject} publicMessage1
 * @param {PublicMessageObject} publicMessage2
 * @return {Number}
 * @see {fetchPublicMessages}
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
