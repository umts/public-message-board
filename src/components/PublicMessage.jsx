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
export default function PublicMessage({id, message, routes}) {
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
      {(id && !routes) && (
        <th scope={'row'}>
          <div className={classNames['route-abbreviation']}>
            ALL
          </div>
        </th>
      )}
      <td colSpan={(routes) ? 1 : 2}>
        {message}
      </td>
    </tr>
  );
}

PublicMessage.propTypes = {
  id: PropTypes.number,
  message: PropTypes.string.isRequired,
  routes: PropTypes.array,
};
