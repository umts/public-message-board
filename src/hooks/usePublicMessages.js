import {useCallback, useEffect, useMemo, useState} from 'react';

/**
 * Stores, maintains and processes public message data from an Avail InfoPoint API.
 *
 * @param {null|URL} infoPoint
 * @param {null|[String]} routes
 * @return {undefined|null|[{}]}
 */
function usePublicMessages(infoPoint, routes) {
  const [publicMessages, setPublicMessages] = useState(undefined);

  const refreshPublicMessages = useCallback(() => {
    fetchPublicMessages(infoPoint).then((publicMessages) => {
      setPublicMessages(publicMessages);
    }).catch((e) => {
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
 * @return {Promise<[{}]>}
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
      });
    });
  });

  return publicMessages;
}

/** Compares two public messages for sorting purposes.
 *
 * @param {{}} publicMessage1
 * @param {{}} publicMessage2
 * @return {Number}
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

export default usePublicMessages;
