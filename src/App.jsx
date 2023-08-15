import useConfig from './hooks/useConfig.js';
import usePublicMessages from './hooks/usePublicMessages.js';

/**
 * TODO: Implement.
 *
 * @constructor
 * @return {JSX.Element}
 */
function App() {
  const {infoPoint, routes} = useConfig();
  const publicMessages = usePublicMessages(infoPoint, routes);

  return (
    <>
      <div>{infoPoint?.toString()}</div>
      <hr />
      <div>{!(routes) ? 'No routes given' : routes.join(', ')}</div>
      {!!(publicMessages) && publicMessages.map((publicMessage) => (
        <div key={publicMessage.key}>
          <hr />
          <dl>
            <dt>Message</dt>
            <dd>{publicMessage.message}</dd>
            <dt>Route Abbreviation</dt>
            <dd>{publicMessage.routeAbbreviation}</dd>
            <dt>Route Color</dt>
            <dd>{publicMessage.routeColor}</dd>
          </dl>
        </div>
      ))}
    </>
  );
}

export default App;
