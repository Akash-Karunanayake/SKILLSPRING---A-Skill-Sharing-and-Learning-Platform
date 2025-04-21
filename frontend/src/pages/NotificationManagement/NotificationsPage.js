import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.css'
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { MdOutlineMarkChatRead } from "react-icons/md";
import { motion } from 'framer-motion';
import { IoNotificationsOutline } from "react-icons/io5";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
        console.log('API Response:', response.data); // Debugging log
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (userId) {
      fetchNotifications();
    } else {
      console.error('User ID is not available');
    }
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsRead`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="notifications-container">
      <NavBar />
      <div className="notifications-content">
        <div className="notifications-header">
          <h1>Notifications</h1>
          <p>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="empty-notifications"
            >
              <IoNotificationsOutline className="empty-icon" />
              <h2>No notifications yet</h2>
              <p>When you receive notifications, they will appear here</p>
            </motion.div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`notification-card ${notification.read ? 'read' : 'unread'}`}
              >
                {!notification.read && <div className="unread-indicator"></div>}
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-time">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="action-btn mark-read"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <MdOutlineMarkChatRead />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="action-btn delete"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete notification"
                  >
                    <RiDeleteBin6Fill />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
