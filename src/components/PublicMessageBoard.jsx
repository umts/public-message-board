import PropTypes from 'prop-types';
import classNames from './PublicMessageBoard.module.css';

/**
 * Component that acts as a container for and provides styling for {@link PublicMessage}s.
 *
 * - Implemented using a table for the sake of equal-width route abbreviation labels.
 *
 * @constructor
 * @param {[PublicMessage]} children - the public messages to display within this message board.
 * @return {JSX.Element}
 */
export default function PublicMessageBoard({children}) {
  return (
    <table className={classNames['public-message-board']}>
      <tbody>
        {children}
      </tbody>
    </table>
  );
}

PublicMessageBoard.propTypes = {
  children: PropTypes.node,
};
