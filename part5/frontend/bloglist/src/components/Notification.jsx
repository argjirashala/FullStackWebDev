import PropTypes from 'prop-types';

const Notification = ({ message = null, type = 'success' }) => {
  if (!message) {
    return null;
  }

  const notificationStyle = {
    padding: '10px',
    margin: '10px 0',
    border: '2px solid',
    borderRadius: '5px',
    fontSize: '16px',
    color: type === 'success' ? 'green' : 'red',
    backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
    borderColor: type === 'success' ? '#c3e6cb' : '#f5c6cb',
  };

  return <div style={notificationStyle}>{message}</div>;
};

Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error']),
};

export default Notification;
