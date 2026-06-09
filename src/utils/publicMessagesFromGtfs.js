export default function publicMessagesFromGtfs(gtfsRoutes, gtfsEntities, routeFilter) {
  if (gtfsRoutes === null || gtfsEntities === null) return null;
  if (gtfsRoutes === undefined || gtfsEntities === undefined) return;

  let gtfs = nestGtfs(gtfsRoutes, gtfsEntities);
  gtfs = filterGtfs(gtfs, routeFilter);
  gtfs = sortGtfs(gtfs);
  return normalizeGtfs(gtfs);
}

function nestGtfs(gtfsRoutes, gtfsEntities) {
  const routesGtfsMap = {};
  for (const gtfsRoute of gtfsRoutes) {
    routesGtfsMap[gtfsRoute.routeId] = gtfsRoute;
  }

  return (
    gtfsEntities
      .filter((gtfsEntity) => {
        // Sometimes alerts have their routes vanish from the schedule. We don't want to display those alerts, so filter
        // them out. Alerts are prototyped, so blank route ids end up being empty strings. So we will end up filtering
        // out agency wide alerts without that second conditional.
        return (
          gtfsEntity.alert.informedEntity.some((entity) => entity.routeId in routesGtfsMap) ||
          gtfsEntity.alert.informedEntity.every(
            (entity) => entity.agencyId && entity.routeId === "",
          )
        );
      })
      // oxlint-disable-next-line oxc/no-map-spread
      .map((gtfsEntity) => {
        const routeIds = [
          ...new Set(
            gtfsEntity.alert.informedEntity.map((entity) => entity.routeId).filter(Boolean),
          ),
        ];
        return {
          ...gtfsEntity,
          alert: {
            ...gtfsEntity.alert,
            informedEntity: routeIds.map((routeId) => routesGtfsMap[routeId]).filter(Boolean),
          },
        };
      })
  );
}

function filterGtfs(gtfsEntities, routeFilter) {
  return (
    gtfsEntities
      .filter((gtfsEntity) => {
        if (routeFilter === null) return true;
        if (gtfsEntity.alert.informedEntity.length === 0) return true;

        return gtfsEntity.alert.informedEntity.some((route) =>
          routeFilter.includes(route.routeShortName),
        );
      })
      // oxlint-disable-next-line oxc/no-map-spread
      .map((gtfsEntity) => {
        // filter individual routes
        return {
          ...gtfsEntity,
          alert: {
            ...gtfsEntity.alert,
            informedEntity: gtfsEntity.alert.informedEntity.filter((route) => {
              if (routeFilter === null) return true;

              return routeFilter.includes(route.routeShortName);
            }),
          },
        };
      })
  );
}

function sortGtfs(gtfsEntities) {
  return gtfsEntities
    .map((gtfsEntity) => {
      // sort individual routes
      return {
        ...gtfsEntity,
        alert: {
          ...gtfsEntity.alert,
          informedEntity: gtfsEntity.alert.informedEntity.toSorted((route1, route2) => {
            const sortOrder1 = route1.routeSortOrder
              ? Number.parseInt(route1.routeSortOrder, 10)
              : Infinity;
            const sortOrder2 = route2.routeSortOrder
              ? Number.parseInt(route2.routeSortOrder, 10)
              : Infinity;
            return sortOrder1 - sortOrder2;
          }),
        },
      };
    })
    .toSorted((alert1, alert2) => {
      // sort by lowest route sort order
      const routeSortOrders1 = alert1.alert.informedEntity
        .map((route) => route.routeSortOrder)
        .filter((v) => v !== undefined);
      const routeSortOrders2 = alert2.alert.informedEntity
        .map((route) => route.routeSortOrder)
        .filter((v) => v !== undefined);
      const sortOrder1 = routeSortOrders1.length > 0 ? Math.min(...routeSortOrders1) : -Infinity;
      const sortOrder2 = routeSortOrders2.length > 0 ? Math.min(...routeSortOrders2) : -Infinity;
      return sortOrder1 - sortOrder2;
    });
}

function normalizeGtfs(gtfs) {
  return gtfs.map((gtfsEntity) => {
    return {
      id: gtfsEntity.id,
      header: gtfsEntity.alert.headerText.translation[0].text,
      description: gtfsEntity.alert.descriptionText.translation[0].text,
      routes: gtfsEntity.alert.informedEntity.map((route) => {
        return {
          id: route.routeId,
          abbreviation: route.routeShortName,
          color: route.routeColor,
          textColor: route.routeTextColor,
        };
      }),
    };
  });
}
