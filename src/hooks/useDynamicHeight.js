import {useEffect} from 'react';

/**
 * TODO: Document.
 *
 * @return {undefined}
 */
export default function useDynamicHeight() {
  return useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        top.postMessage({height: entry.contentRect.height}, '*');
      });
    });
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, []);
}
