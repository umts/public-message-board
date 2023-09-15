import PropTypes from 'prop-types';
import classNames from './PublicMessage.module.css';

/**
 * Component that displays a message within a {@link PublicMessageBoard}.
 *
 * @constructor
 * @param {String} message - the text content of the message to be displayed.
 * @param {Array} routes - list of routes affected.
 * @return {JSX.Element}
 */
export default function PublicMessage({message, priority, routes}) {
  return (
    <tr>
      {(routes) && (
        <th scope={'row'}>
          {routes.map((route) => (
            <div
              key={route.id}
              className={classNames['route-abbreviation']}
              style={{
                backgroundColor: !(route.color) ? undefined : `#${route.color}`,
                color: !(route.textColor) ? undefined : `#${route.textColor}`,
              }}
            >
              {route.abbreviation}
            </div>
          ))}
        </th>
      )}
      <td
        style={{
          'border-right': `3px solid ${PRIORITY_COLORS[priority]}`,
        }}
        colSpan={(routes) ? 1 : 2}
      >
        {message}
      </td>
    </tr>
  );
}

// Map priority value to the color used on the message's color bar
const PRIORITY_COLORS = {
  '0': '#ff0000',
  '1': '#ff6600',
  '2': '#ffcc00',
  '3': '#00ff00',
  '-1': '#000000',
};

PublicMessage.propTypes = {
  id: PropTypes.number,
  message: PropTypes.string.isRequired,
  priority: PropTypes.number,
  routes: PropTypes.array,
};
