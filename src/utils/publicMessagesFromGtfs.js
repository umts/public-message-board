export default function publicMessagesFromGtfs (gtfsRoutes, gtfsAlerts, routeFilter) {
  if (gtfsRoutes === null || gtfsAlerts === null) return null
  if (gtfsRoutes === undefined || gtfsAlerts === undefined) return undefined

  let gtfs = nestGtfs(gtfsRoutes, gtfsAlerts)
  gtfs = filterGtfs(gtfs, routeFilter)
  gtfs = sortGtfs(gtfs)
  return normalizeGtfs(gtfs)
}

function nestGtfs (gtfsRoutes, gtfsAlerts) {
  const routesGtfsMap = {}
  gtfsRoutes.forEach((gtfsRoute) => { routesGtfsMap[gtfsRoute.routeId] = gtfsRoute })

  // Sometimes alerts have their routes vanish from the schedule. We don't want to display those alerts, so filter
  // them out. Alerts are prototyped, so blank route ids end up being empty strings. So we will end up filtering
  // out agency wide alerts without that second conditional.
  gtfsAlerts = gtfsAlerts.filter((gtfsAlert) => {
    return gtfsAlert.alert.informedEntity.every((entity) => entity.routeId in routesGtfsMap) ||
           gtfsAlert.alert.informedEntity.every((entity) => entity.agencyId && entity.routeId === "")
  })

  return gtfsAlerts.map((gtfsAlert) => {
    const routeIds = [
      ...new Set(gtfsAlert.alert.informedEntity.map((entity) => entity.routeId).filter((routeId) => routeId))
    ]
    return {
      ...gtfsAlert,
      alert: {
        ...gtfsAlert.alert,
        informedEntity: routeIds.map((routeId) => routesGtfsMap[routeId])
      }
    }
  })
}

function filterGtfs (gtfsAlerts, routeFilter) {
  gtfsAlerts = gtfsAlerts.filter((gtfsAlert) => {
    if (routeFilter === null) return true
    if (gtfsAlert.alert.informedEntity.length === 0) return true

    return gtfsAlert.alert.informedEntity.some((route) => routeFilter.includes(route.routeShortName))
  })

  // filter individual routes
  return gtfsAlerts.map((gtfsAlert) => {
    return {
      ...gtfsAlert,
      alert: {
        ...gtfsAlert.alert,
        informedEntity: gtfsAlert.alert.informedEntity.filter((route) => {
          if (routeFilter === null) return true

          return routeFilter.includes(route.routeShortName)
        })
      }
    }
  })
}

function sortGtfs (gtfsAlerts) {
  // sort individual routes
  gtfsAlerts = gtfsAlerts.map((gtfsAlert) => {
    return {
      ...gtfsAlert,
      alert: {
        ...gtfsAlert.alert,
        informedEntity: gtfsAlert.alert.informedEntity.sort((route1, route2) => {
          const sortOrder1 = (route1.routeSortOrder) ? parseInt(route1.routeSortOrder) : Infinity
          const sortOrder2 = (route2.routeSortOrder) ? parseInt(route2.routeSortOrder) : Infinity
          return sortOrder1 - sortOrder2
        })
      }
    }
  })

  // sort by lowest route sort order
  return gtfsAlerts.sort((alert1, alert2) => {
    const routeSortOrders1 = alert1.alert.informedEntity.map((route) => route.routeSortOrder)
    const routeSortOrders2 = alert2.alert.informedEntity.map((route) => route.routeSortOrder)
    const sortOrder1 = (routeSortOrders1.length > 0) ? Math.min(...routeSortOrders1) : -Infinity
    const sortOrder2 = (routeSortOrders2.length > 0) ? Math.min(...routeSortOrders2) : -Infinity
    return sortOrder1 - sortOrder2
  })
}

function normalizeGtfs (gtfs) {
  return gtfs.map((gtfsAlert) => {
    return {
      id: gtfsAlert.id,
      header: gtfsAlert.alert.headerText.translation[0].text,
      description: gtfsAlert.alert.descriptionText.translation[0].text,
      routes: gtfsAlert.alert.informedEntity.map((route) => {
        return {
          id: route.routeId,
          abbreviation: route.routeShortName,
          color: route.routeColor,
          textColor: route.textColor,
        }
      })
    }
  })
}
