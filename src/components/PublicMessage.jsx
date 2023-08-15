import PropTypes from 'prop-types';
import classNames from './PublicMessage.module.css';

/**
 * Component that displays a message within a {@link PublicMessageBoard}.
 *
 * @constructor
 * @param {String|null} routeAbbreviation - an optional route abbreviation to label this message with.
 * @param {String|null} routeColor - an optional background color override for the route label.
 * @param {String} message - the text content of the message to be displayed.
 * @return {JSX.Element}
 */
export default function PublicMessage({routeAbbreviation, routeColor, message}) {
  return (
    <tr>
      {(routeAbbreviation) && (
        <th scope={'row'}>
          <div
            className={classNames['route-abbreviation']}
            style={{backgroundColor: !(routeColor) ? undefined : `#${routeColor}`}}
          >
            {routeAbbreviation}
          </div>
        </th>
      )}
      <td colSpan={(routeAbbreviation) ? 1 : 2}>
        {message}
      </td>
    </tr>
  );
}

PublicMessage.propTypes = {
  routeAbbreviation: PropTypes.string,
  routeColor: PropTypes.string,
  message: PropTypes.string.isRequired,
};
