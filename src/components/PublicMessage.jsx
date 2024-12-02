import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import classNames from './PublicMessage.module.css'

/**
 * Component that displays a message within a {@link PublicMessageBoard}.
 *
 * @constructor
 * @param {String} message - the text content of the message to be displayed (HTML Supported).
 * @param {Number|undefined} priority - the "priority" level specified by Avail.
 * @param {Array|undefined} routes - list of routes affected. Left undefined if message is an error
 * @return {JSX.Element}
 */
export default function PublicMessage ({ message, priority, routes }) {
  return (
    <tr>
      {(routes) && (
        <th scope='row'>
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
        className={
          (typeof (priority) === 'number')
            ? `${classNames['priority']} ${classNames[`priority-${priority}`]}`
            : undefined
        }
        colSpan={(routes) ? 1 : 2}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message) }}
      />
    </tr>
  )
}

PublicMessage.propTypes = {
  message: PropTypes.string.isRequired,
  priority: PropTypes.number,
  routes: PropTypes.array,
}
