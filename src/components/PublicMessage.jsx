import PropTypes from 'prop-types';
import classNames from './PublicMessage.module.css';

/**
 * Component that displays a message within a {@link PublicMessageBoard}.
 *
 * @constructor
 * @param {String} message - the text content of the message to be displayed.
 * @param {Number} priority - the "priority" level specified by Avail.
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
        className={`${classNames['priority']} ${classNames[`priority-${priority}`]}`}
        colSpan={(routes) ? 1 : 2}
      >
        {message}
      </td>
    </tr>
  );
}

PublicMessage.propTypes = {
  id: PropTypes.number,
  message: PropTypes.string.isRequired,
  priority: PropTypes.number,
  routes: PropTypes.array,
};
