import { useSelector } from 'react-redux';

const Notification = () => {
  const notification = useSelector((state) => state.notification);

  if (!notification.message) {
    return null;
  }

  const notificationStyle = {
    padding: '10px',
    margin: '10px 0',
    border: '2px solid',
    borderRadius: '5px',
    fontSize: '16px',
    color: notification.type === 'success' ? 'green' : 'red',
    backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
    borderColor: notification.type === 'success' ? '#c3e6cb' : '#f5c6cb',
  };

  return <div style={notificationStyle}>{notification.message}</div>;
};

export default Notification;
