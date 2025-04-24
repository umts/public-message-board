import { camelCase } from 'change-case'
import Papa from 'papaparse'
import { useEffect, useState } from 'react'

export default function useGtfsFile (gtfs, file) {
  const [data, setData] = useState(undefined)
  useEffect(() => {
    if (gtfs === undefined || gtfs === null) {
      setData(gtfs)
    } else {
      gtfs.files[`${file}.txt`].async('text').then(parseCsv).then((json) => setData(json))
    }
  }, [gtfs, file])
  return data
}

async function parseCsv (csvString) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, { header: true, transformHeader: camelCase, complete: (result) => resolve(result.data) })
  })
}
