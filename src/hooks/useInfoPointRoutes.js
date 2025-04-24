import { useEffect, useState } from 'react'

export default function useInfoPointRoutes (infoPointUrl) {
  const [routes, setRoutes] = useState(undefined)
  useEffect(() => {
    async function fetchRoutes () {
      try {
        const response = await fetch(new URL('Routes/GetAllRoutes', infoPointUrl))
        const responseJson = await response.json()
        const normalizedRoutes = responseJson.map((infoPointRoute) => ({
          routeId: infoPointRoute['RouteId'],
          routeShortName: infoPointRoute['RouteAbbreviation'],
          routeColor: infoPointRoute['Color'],
          routeTextColor: infoPointRoute['TextColor']
        }))
        setRoutes(normalizedRoutes)
      } catch {
        setRoutes(null)
      }
    }
    fetchRoutes()
    const interval = setInterval(fetchRoutes, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [infoPointUrl])
  return routes
}
