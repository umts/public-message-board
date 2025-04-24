import JSZip from 'jszip'
import Papa from 'papaparse'
import { useEffect, useState } from 'react'

async function parseCsvAsJson (csvString) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, { header: true, complete: (result) => resolve(result.data) })
  })
}

function removeExtension (filename) {
  return filename.substring(0, filename.lastIndexOf('.')) || filename
}

export default function useGtfs (url) {
  const [data, setData] = useState([])

  useEffect(() => {
    async function refresh () {
      const response = await fetch(url)
      const buffer = await response.arrayBuffer()
      const zip = await JSZip.loadAsync(buffer)
      const data = {}
      for (const [filename, file] of Object.entries(zip.files)) {
        const csvString = await file.async('text')
        data[removeExtension(filename)] = await parseCsvAsJson(csvString)
      }
      console.log(data)
      setData(data)
    }
    refresh()
    const interval = setInterval(refresh, 30 * 1000)
    return () => clearInterval(interval)
  }, [url])
  return data
}
