export default function publicMessagesFromGtfs (routesGtfs, alertsGtfs, routeFilter) {
  if (routesGtfs === null || alertsGtfs === null) return null
  if (routesGtfs === undefined || alertsGtfs === undefined) return undefined

  const routesGtfsMap = {}
  routesGtfs.forEach((routeGtfs) => { routesGtfsMap[routeGtfs.routeId] = routeGtfs })

  return alertsGtfs.filter((alertGtfs) => {
    return true
  }).sort((alertGtfs1, alertGtfs2) => {
    return 0
  }).map((alertGtfs) => ({
    id: alertGtfs.id,
    header: alertGtfs.alert.headerText?.translation[0]?.text,
    description: alertGtfs.alert.descriptionText.translation[0].text,
    routes: [...new Set(alertGtfs.alert.informedEntity.map((entity) => entity.routeId))].filter((routeId) => {
      return true
    }).map((routeId) => ({
      id: routeId,
      abbreviation: routesGtfsMap[routeId].routeShortName,
      color: routesGtfsMap[routeId].routeColor,
      textColor: routesGtfsMap[routeId].textColor,
    }))
  }))
}
