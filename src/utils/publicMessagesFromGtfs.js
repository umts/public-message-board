export default function publicMessagesFromGtfs (routesGtfs, alertsGtfs, routeFilter) {
  if (routesGtfs === null || alertsGtfs === null) return null
  if (routesGtfs === undefined || alertsGtfs === undefined) return undefined

  let gtfs = nestGtfs(routesGtfs, alertsGtfs)
  gtfs = filterGtfs(gtfs, routeFilter)
  gtfs = sortGtfs(gtfs)
  return normalizeGtfs(gtfs)
}

function nestGtfs (routesGtfs, alertsGtfs) {
  const routesGtfsMap = {}
  routesGtfs.forEach((routeGtfs) => { routesGtfsMap[routeGtfs.routeId] = routeGtfs })

  // filter out alerts that contain routes that we don't recognize
  // can happen if a long-running alert is created for a route before a change in the gtfs file removes it
  alertsGtfs = alertsGtfs.filter((alertGtfs) => {
    return alertGtfs.alert.informedEntity.every((entity) => entity.routeId in routesGtfsMap)
  })

  return alertsGtfs.map((alertGtfs) => {
    const routeIds = [...new Set(alertGtfs.alert.informedEntity.map((entity) => entity.routeId))]
    return {
      ...alertGtfs,
      alert: {
        ...alertGtfs.alert,
        informedEntity: routeIds.map((routeId) => routesGtfsMap[routeId])
      }
    }
  })
}

function filterGtfs (alertsGtfs, routeFilter) {
  alertsGtfs = alertsGtfs.filter((alertGtfs) => {
    if (routeFilter === null) return true
    if (alertGtfs.alert.informedEntity.length === 0) return true

    return alertGtfs.alert.informedEntity.some((route) => routeFilter.includes(route.routeShortName))
  })

  // filter individual routes
  return alertsGtfs.map((alertGtfs) => {
    return {
      ...alertGtfs,
      alert: {
        ...alertGtfs.alert,
        informedEntity: alertGtfs.alert.informedEntity.filter((route) => {
          if (routeFilter === null) return true

          return routeFilter.includes(route.routeShortName)
        })
      }
    }
  })
}

function sortGtfs (alertsGtfs) {
  // sort individual routes
  alertsGtfs = alertsGtfs.map((alertGtfs) => {
    return {
      ...alertGtfs,
      alert: {
        ...alertGtfs.alert,
        informedEntity: alertGtfs.alert.informedEntity.sort((route1, route2) => {
          const sortOrder1 = (route1.routeSortOrder) ? parseInt(route1.routeSortOrder) : Infinity
          const sortOrder2 = (route2.routeSortOrder) ? parseInt(route2.routeSortOrder) : Infinity
          return sortOrder1 - sortOrder2
        })
      }
    }
  })

  // sort by lowest route sort order
  return alertsGtfs.sort((alert1, alert2) => {
    const routeSortOrders1 = alert1.alert.informedEntity.map((route) => route.routeSortOrder)
    const routeSortOrders2 = alert2.alert.informedEntity.map((route) => route.routeSortOrder)
    const sortOrder1 = (routeSortOrders1.length > 0) ? Math.min(...routeSortOrders1) : Infinity
    const sortOrder2 = (routeSortOrders2.length > 0) ? Math.min(...routeSortOrders2) : Infinity
    return sortOrder1 - sortOrder2
  })
}

function normalizeGtfs (gtfs) {
  return gtfs.map((alertGtfs) => {
    return {
      id: alertGtfs.id,
      header: alertGtfs.alert.headerText?.translation[0]?.text,
      description: alertGtfs.alert.descriptionText.translation[0].text,
      routes: alertGtfs.alert.informedEntity.map((route) => {
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
