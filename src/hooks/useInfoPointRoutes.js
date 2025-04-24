import { useCallback } from 'react'
import useRefresh from './useRefresh.js'

export default function useInfoPointRoutes (url) {
  const fetchRoutes = useCallback(async () => {
    if (!(url)) return null
    const response = await fetch(new URL('Routes/GetAllRoutes', url))
    const responseJson = await response.json()
    return responseJson.map((infoPointRoute) => ({
      routeId: infoPointRoute['RouteId'],
      routeShortName: infoPointRoute['RouteAbbreviation'],
      routeColor: infoPointRoute['Color'],
      routeTextColor: infoPointRoute['TextColor'],
      routeSortOrder: infoPointRoute['SortOrder']
    }))
  }, [url])
  return useRefresh(fetchRoutes, 24 * 60 * 60 * 1000)
}
