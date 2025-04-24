import { camelCase } from 'change-case'
import JSZip from 'jszip'
import Papa from 'papaparse'
import { useCallback } from 'react'
import useRefresh from './useRefresh.js'

export default function useGtfs (url) {
  const fetchGtfs = useCallback(async () => {
    const response = await fetch(url)
    const responseBuffer = await response.arrayBuffer()
    const zip = await JSZip.loadAsync(responseBuffer)
    const data = {}
    for (const [filename, file] of Object.entries(zip.files)) {
      const csvString = await file.async('text')
      data[removeExtension(filename)] = await parseCsvAsJson(csvString)
    }
    return data
  }, [url])
  return useRefresh(fetchGtfs, 24 * 60 * 60 * 1000)
}

function removeExtension (filename) {
  return filename.substring(0, filename.lastIndexOf('.')) || filename
}

async function parseCsvAsJson (csvString) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, { header: true, transformHeader: camelCase, complete: (result) => resolve(result.data) })
  })
}
