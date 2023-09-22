import {useCallback, useEffect, useMemo, useState} from 'react';

/**
 * @typedef PublicMessageObject
 * @property {Number} id - a unique id for the message, from InfoPoint
 * @property {String} message - the text for a public message (HTML Supported).
 * @property {Number} priority - the priority of the message specified by Avail.
 * @property {[RouteObject]} routes - list of routes affected by this message, empty if message is general.
 */

/**
 * @typedef RouteObject
 * @property {Number} id - a unique id for the route, from InfoPoint
 * @property {String} abbreviation - a short name for a route.
 * @property {String|null} color - a color (hex string but without #) override for a route's background, if applicable.
 * @property {String|null} textColor - a color (hex string but without #) override for a route's text, if applicable.
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
    if (!(publicMessages instanceof Array)) {
      return publicMessages;
    } else {
      return normalizePublicMessages(sortPublicMessages(filterPublicMessages(publicMessages, routes)));
    }
  }, [routes, publicMessages]);
}

/**
 * Fetches public message data from an Avail InfoPoint API.
 *
 * @param {URL} infoPoint
 * @return {Promise<[{}]>}
 * @see {usePublicMessages}
 */
async function fetchPublicMessages(infoPoint) {
  const routesByID = {};
  const getAllRoutesResponse = await fetch(new URL('Routes/GetAllRoutes', infoPoint));
  const getAllRoutesJSON = await getAllRoutesResponse.json();
  getAllRoutesJSON.forEach((route) => {
    routesByID[route['RouteId']] = route;
  });

  const getCurrentMessagesResponse = await fetch(new URL('PublicMessages/GetCurrentMessages', infoPoint));
  const getCurrentMessagesJSON = await getCurrentMessagesResponse.json();
  return getCurrentMessagesJSON.map((publicMessage) => ({
    ...publicMessage,
    'Routes': publicMessage['Routes']?.map((routeID) => routesByID[routeID]) || [],
  }));
}

/**
 * TODO: Document.
 *
 * @param {[{}]} publicMessages
 * @param {[String]|null} routeAbbreviations
 * @return {[{}]}
 */
function filterPublicMessages(publicMessages, routeAbbreviations) {
  return publicMessages.filter((message) => {
    if ((routeAbbreviations instanceof Array) && (message['Routes'].length > 0)) {
      return message['Routes'].some((route) => route['RouteAbbreviation'].includes(route.abbreviation));
    } else {
      return true;
    }
  });
}

/**
 * TODO: Document.
 *
 * @param {[{}]} publicMessages
 * @return {[{}]}
 */
function sortPublicMessages(publicMessages) {
  const ensureComparable = (value) => (typeof(value) === 'number') ? value : Infinity;
  const minimumComparable = (values) => (values.length > 0) ? Math.min(values) : Infinity;

  return publicMessages.map((message) => ({
    ...message,
    'Routes': message['Routes'].sort((route1, route2) => {
      const sortOrder1 = ensureComparable(route1['SortOrder']);
      const sortOrder2 = ensureComparable(route2['SortOrder']);
      return sortOrder1 - sortOrder2;
    }),
  })).sort((message1, message2) => {
    const priority1 = ensureComparable(message1['Priority']);
    const priority2 = ensureComparable(message2['Priority']);
    if (priority1 !== priority2) return priority1 - priority2;

    const routeSortOrder1 = minimumComparable(message1['Routes'].map((route) => ensureComparable(route['SortOrder'])));
    const routeSortOrder2 = minimumComparable(message2['Routes'].map((route) => ensureComparable(route['SortOrder'])));
    return routeSortOrder1 - routeSortOrder2;
  });
}

/**
 * TODO: Document.
 *
 * @param {[{}]} publicMessages
 * @return {[{PublicMessageObject}]}
 */
function normalizePublicMessages(publicMessages) {
  return publicMessages.map((message) => ({
    id: message['MessageId'],
    message: message['Message'],
    priority: message['Priority'],
    routes: message['Routes'].map((route) => ({
      id: route['RouteId'],
      abbreviation: route['RouteAbbreviation'],
      color: route['Color'] || null,
      textColor: route['TextColor'] || null,
    })),
  }));
}
