import { useEffect } from 'react'

/**
 * Communicates the height of the application to a parent window when embedded in an iframe, allowing for dynamic sizing
 * of the iframe in the parent document.
 *
 * Through the ResizeObserver API, we watch for changes in the body's height, and forward them up to the parent document
 * using the postMessage API, which allows for cross-origin communication through an iframe.
 *
 * It only sends the height data up, the parent document itself must then consume the data and size the iframe
 * accordingly (see README for sample implementation).
 *
 * @return {undefined}
 */
export default function useDynamicHeight () {
  return useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        top.postMessage({ height: entry.contentRect.height }, '*')
      })
    })
    resizeObserver.observe(document.body)
    return () => resizeObserver.disconnect()
  }, [])
}
