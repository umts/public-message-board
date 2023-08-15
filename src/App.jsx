import PublicMessage from './components/PublicMessage.jsx';
import PublicMessageBoard from './components/PublicMessageBoard.jsx';
import useConfig from './hooks/useConfig.js';
import usePublicMessages from './hooks/usePublicMessages.js';

/**
 * Application entrypoint.
 *
 * @constructor
 * @return {JSX.Element}
 */
export default function App() {
  const {infoPoint, routes} = useConfig();
  const publicMessages = usePublicMessages(infoPoint, routes);

  return (
    <PublicMessageBoard>
      {(publicMessages === undefined) ? null : (publicMessages === null) ? (
        <PublicMessage message={'Failed to load message information.'}/>
      ) : (publicMessages.length === 0) ? (
        <PublicMessage message={'No relevant messages found.'}/>
      ) : publicMessages.map(({key, ...message}) => (
        <PublicMessage key={key} {...message} />
      ))}
    </PublicMessageBoard>
  );
}
