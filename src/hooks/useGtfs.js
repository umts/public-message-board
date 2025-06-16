import { camelCase } from 'change-case'
import JSZip from 'jszip'
import Papa from 'papaparse'
import { useCallback, useEffect, useState } from 'react'
import useRefresh from './useRefresh.js'

export default function useGtfs (url) {
  const fetchGtfs = useCallback(async () => {
    if (!(url)) return null
    const response = await fetch(url)
    const responseBuffer = await response.arrayBuffer()
    return await JSZip.loadAsync(responseBuffer)
  }, [url])
  const gtfs = useRefresh(fetchGtfs, 24 * 60 * 60 * 1000)

  const [data, setData] = useState(undefined)
  useEffect(() => {
    if (gtfs === null || gtfs === undefined) {
      setData(gtfs)
    } else {
      setData({})
      const cache = {}
      for (const [filename, file] of Object.entries(gtfs.files)) {
        file.async('text').then(parseCsv).then((json) => {
          cache[removeExtension(filename)] = json
          setData({ ...cache })
        })
      }
    }
  }, [gtfs])
  return data
}

async function parseCsv (csvString) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, { header: true, transformHeader: camelCase, complete: (result) => resolve(result.data) })
  })
}

function removeExtension (filename) {
  return filename.replace(/\.[^/.]+$/, '')
}
