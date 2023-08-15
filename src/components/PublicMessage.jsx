import PropTypes from 'prop-types';
import classNames from './PublicMessage.module.css';

/**
 * Renders a single public message.
 *
 * @constructor
 * @param {String?} route
 * @param {String?} routeColor
 * @param {String} message
 * @return {JSX.Element}
 */
export default function PublicMessage({routeAbbreviation, routeColor, message}) {
  return (
    <tr>
      {(routeAbbreviation) && (
        <th>
          <div
            className={classNames['route-abbreviation']}
            style={{backgroundColor: !(routeColor) ? undefined : `#${routeColor}`}}
          >
            {routeAbbreviation}
          </div>
        </th>
      )}
      <td colSpan={(routeAbbreviation) ? 1 : 2}>
        <div>
          {message}
        </div>
      </td>
    </tr>
  );
}

PublicMessage.propTypes = {
  routeAbbreviation: PropTypes.string,
  routeColor: PropTypes.string,
  message: PropTypes.string.isRequired,
};
