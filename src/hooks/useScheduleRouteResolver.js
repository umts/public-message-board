import { useFetchResolver } from 'gtfs-react-hooks'


export default function useScheduleRouteResolver(url) {
  return useFetchResolver(url)
}