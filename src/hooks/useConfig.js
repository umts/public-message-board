import {useMemo} from 'react';

/**
 * Parses configuration options from url search parameters.
 *
 * @return {{routes: Array<String>?}}
 */
function useConfig() {
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      routes: searchParams.get('routes')?.split(','),
    };
  }, []);
}

export default useConfig;
