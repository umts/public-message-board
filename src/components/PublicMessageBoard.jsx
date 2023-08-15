import PropTypes from 'prop-types';
import classNames from './PublicMessageBoard.module.css';

/**
 * Renders a given set of public messages.
 *
 * @constructor
 * @param {[Message]} children
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
  children: PropTypes.arrayOf(PropTypes.element),
};
