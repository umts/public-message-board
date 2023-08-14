import useConfig from './hooks/useConfig.js';

/**
 * TODO: Implement.
 *
 * @constructor
 * @return {JSX.Element}
 */
function App() {
  const {routes} = useConfig();
  return (
    <div>{!(routes) ? 'No routes given' : routes.join(', ')}</div>
  );
}

export default App;
