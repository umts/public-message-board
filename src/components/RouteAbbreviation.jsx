import { useMemo } from "react";
import classNames from "./RouteAbbreviation.module.css";

/**
 * Component that displays a colored route abbreviation.
 *
 * @constructor
 * @param {Object} route - the route to display the abbreviation for.
 * @return {JSX.Element}
 */
export default function RouteAbbreviation({ route }) {
  const colors = useMemo(
    () => ({
      backgroundColor: route.color && `#${route.color}`,
      color: route.textColor && `#${route.textColor}`,
    }),
    [route.color, route.textColor],
  );

  return (
    <div className={classNames["route-abbreviation"]} style={colors}>
      {route.abbreviation}
    </div>
  );
}
