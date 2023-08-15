import {useCallback, useEffect, useMemo, useState} from 'react';

/**
 * @typedef PublicMessageObject
 * @property {String} key - a unique key for a route/message pair.
 * @property {String} message - the text for a public message.
 * @property {String|null} routeAbbreviation - a short name for a route if applicable, null if the message is general.
 * @property {String|null} routeColor - a color (hex string but without #) override for a route's background if
 *                                      applicable, null if the message is general.
 * @property {String|null} routeTextColor - a color (hex string but without #) override for a route's text if
 *                                          applicable, null if the message is general.
 */

/**
 * Hook responsible for fetching, storing, maintaining and processing public message data from a remote Avail InfoPoint
 * API endpoint.
 *
 * - Will return `undefined` if data has not yet been fetched yet.
 * - Will return `null` if an error occurs during fetching.
 * - Will re-fetch and re-process data periodically.
 * - Will sort public messages with general (routeless) messages first, then by number (route abbreviation substring),
 *   then lexically by route abbreviation and message.
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
      if ((routes instanceof Array) && (publicMessage.routeAbbreviation)) {
        return routes.includes(publicMessage.routeAbbreviation);
      } else {
        return true;
      }
    }).map((publicMessage) => {
      return {...publicMessage, routeAbbreviation: publicMessage.routeAbbreviation || 'ALL'};
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
    publicMessage['Routes'].forEach((routeId) => {
      const route = routesById[routeId] || {};
      publicMessages.push({
        key: [publicMessage['MessageId'], route['RouteId']].filter((presence) => (presence)).join('-'),
        message: publicMessage['Message'],
        routeAbbreviation: route['RouteAbbreviation'] || null,
        routeColor: route['Color'] || null,
        routeTextColor: route['TextColor'] || null,
      });
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
  const [route1, route2] = [publicMessage1.routeAbbreviation, publicMessage2.routeAbbreviation];
  const [message1, message2] = [publicMessage1.message, publicMessage2.message];
  if (!(route1) && route2) {
    return -1;
  } else if (route1 && !(route2)) {
    return 1;
  } else if ((!(route1) && !(route2)) || (route1 === route2)) {
    return message1.localeCompare(message2);
  } else {
    const numberMatch1 = route1.match(/\d+/);
    const numberMatch2 = route2.match(/\d+/);
    if (numberMatch1 && numberMatch2) {
      const number1 = parseInt(numberMatch1[0]);
      const number2 = parseInt(numberMatch2[0]);
      if (number1 !== number2) return number1 - number2;
    }
    return route1.localeCompare(route2);
  }
}
