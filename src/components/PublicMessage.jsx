import PropTypes from 'prop-types';
import classNames from './PublicMessage.module.css';

/**
 * Component that displays a message within a {@link PublicMessageBoard}.
 *
 * @constructor
 * @param {String|null} routeAbbreviation - an optional route abbreviation to label this message with.
 * @param {String|null} routeColor - an optional background color override for the route label.
 * @param {String|null} routeTextColor - an optional text color override for the route label.
 * @param {String} message - the text content of the message to be displayed.
 * @return {JSX.Element}
 */
export default function PublicMessage({message, routes}) {
  return (
    <tr>
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
      <td colSpan={(routes) ? 1 : 2}>
        {message}
      </td>
    </tr>
  );
}

PublicMessage.propTypes = {
  message: PropTypes.string.isRequired,
  routes: PropTypes.array,
};
