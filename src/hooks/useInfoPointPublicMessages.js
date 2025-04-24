import { useCallback } from 'react'
import useRefresh from './useRefresh.js'

export default function useInfoPointPublicMessages (url) {
  const fetchPublicMessages = useCallback(async () => {
    if (!(url)) return null
    const response = await fetch(new URL('PublicMessages/GetCurrentMessages', url))
    const responseJson = await response.json()
    return responseJson.map((infoPointPublicMessage) => ({
      id: infoPointPublicMessage['MessageId'],
      alert: {
        activePeriod: [],
        descriptionText: { translation: [{ text: infoPointPublicMessage['Message'] }] },
        informedEntity: infoPointPublicMessage['Routes']?.map((routeId) => ({ routeId }))
      }
    }))
  }, [url])
  return useRefresh(fetchPublicMessages, 24 * 60 * 60 * 1000)
}
