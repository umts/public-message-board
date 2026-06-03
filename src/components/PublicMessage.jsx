import DOMPurify from "dompurify";
import { useMemo } from "react";
import classNames from "./PublicMessage.module.css";
import RouteAbbreviation from "./RouteAbbreviation.jsx";

/**
 * Component that displays a message within a {@link PublicMessageBoard}.
 *
 * @constructor
 * @param {String} message - the text content of the message to be displayed (HTML Supported).
 * @param {Array|undefined} routes - list of routes affected. Left undefined if message is an error
 * @return {JSX.Element}
 */
export default function PublicMessage({ routes, header, description }) {
  const sanitizedDescriptionHTML = useMemo(
    () => ({ __html: DOMPurify.sanitize(description) }),
    [description],
  );
  return (
    <tr>
      {routes && (
        <th scope="row">
          {routes.map((route) => (
            <RouteAbbreviation key={route.id} route={route} />
          ))}
        </th>
      )}
      <td colSpan={routes ? 1 : 2}>
        {header && <div className={classNames["header"]}>{header}</div>}
        {/* oxlint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={sanitizedDescriptionHTML} />
      </td>
    </tr>
  );
}
