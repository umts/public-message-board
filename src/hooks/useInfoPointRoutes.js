import { useCallback } from 'react'
import useRefresh from './useRefresh.js'

export default function useInfoPointRoutes (infoPointUrl) {
  const fetchRoutes = useCallback(async () => {
    const response = await fetch(new URL('Routes/GetAllRoutes', infoPointUrl))
    const responseJson = await response.json()
    return responseJson.map((infoPointRoute) => ({
      routeId: infoPointRoute['RouteId'],
      routeShortName: infoPointRoute['RouteAbbreviation'],
      routeColor: infoPointRoute['Color'],
      routeTextColor: infoPointRoute['TextColor']
    }))
  }, [infoPointUrl])
  return useRefresh(fetchRoutes, 24 * 60 * 60 * 1000)
}
