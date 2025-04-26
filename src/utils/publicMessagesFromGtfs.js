export default function publicMessagesFromGtfs (routesGtfs, alertsGtfs, routeFilter) {
  if (routesGtfs === null || alertsGtfs === null) return null
  if (routesGtfs === undefined || alertsGtfs === undefined) return undefined
  const routesGtfsMap = {}
  routesGtfs.forEach((routeGtfs) => { routesGtfsMap[routeGtfs.routeId] = routeGtfs })
  return alertsGtfs.filter((alertGtfs) => {
    if (routeFilter === null) return true
    if (alertGtfs.alert.informedEntity.length === 0) return true
    return [...new Set(alertGtfs.alert.informedEntity.map((entity) => entity.routeId))].some((routeId) =>
      routeFilter.includes(routesGtfsMap[routeId].routeShortName)
    )
  }).sort((alertGtfs1, alertGtfs2) => {
    const routeSortOrders1 = [...new Set(alertGtfs1.alert.informedEntity.map((entity) => (
      entity.routeId
    )))].map((routeId) => {
      return routesGtfsMap[routeId]
    }).map((route) => (route.routeSortOrder) ? parseInt(route.routeSortOrder) : Infinity)
    const routeSortOrders2 = [...new Set(alertGtfs2.alert.informedEntity.map((entity) => (
      entity.routeId
    )))].map((routeId) => {
      return routesGtfsMap[routeId]
    }).map((route) => (route.routeSortOrder) ? parseInt(route.routeSortOrder) : Infinity)
    const sortOrder1 = (routeSortOrders1.length > 0) ? Math.min(...routeSortOrders1) : Infinity
    const sortOrder2 = (routeSortOrders2.length > 0) ? Math.min(...routeSortOrders2) : Infinity
    return sortOrder1 - sortOrder2
  }).map((alertGtfs) => ({
    id: alertGtfs.id,
    header: alertGtfs.alert.headerText?.translation[0]?.text,
    description: alertGtfs.alert.descriptionText.translation[0].text,
    routes: [...new Set(alertGtfs.alert.informedEntity.map((entity) => entity.routeId))].map((routeId) => {
      return routesGtfsMap[routeId]
    }).filter((route) => {
      return routeFilter === null || routeFilter.includes(route.routeShortName)
    }).sort((route1, route2) => {
      const sortOrder1 = (route1.routeSortOrder) ? parseInt(route1.routeSortOrder) : Infinity
      const sortOrder2 = (route2.routeSortOrder) ? parseInt(route2.routeSortOrder) : Infinity
      return sortOrder1 - sortOrder2
    }).map((route) => ({
      id: route.routeId,
      abbreviation: route.routeShortName,
      color: route.routeColor,
      textColor: route.textColor,
    }))
  }))
}
