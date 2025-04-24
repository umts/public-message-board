import { camelCase } from 'change-case'
import JSZip from 'jszip'
import Papa from 'papaparse'
import { useEffect, useState } from 'react'

export default function useGtfs (gtfsUrl) {
  const [gtfs, setGtfs] = useState(undefined)
  useEffect(() => {
    async function fetchGtfs () {
      try {
        const response = await fetch(gtfsUrl)
        const responseBuffer = await response.arrayBuffer()
        const zip = await JSZip.loadAsync(responseBuffer)
        const data = {}
        for (const [filename, file] of Object.entries(zip.files)) {
          const csvString = await file.async('text')
          data[removeExtension(filename)] = await parseCsvAsJson(csvString)
        }
        setGtfs(data)
      } catch {
        setGtfs(null)
      }
    }
    fetchGtfs()
    const interval = setInterval(fetchGtfs, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [gtfsUrl])
  return gtfs
}

function removeExtension (filename) {
  return filename.substring(0, filename.lastIndexOf('.')) || filename
}

async function parseCsvAsJson (csvString) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, { header: true, transformHeader: camelCase, complete: (result) => resolve(result.data) })
  })
}
