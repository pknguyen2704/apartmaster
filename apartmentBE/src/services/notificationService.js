const Notification = require('../models/notificationModel');

const notificationService = {
  getAllNotifications: async () => {
    try {
      return await Notification.getAllNotifications();
    } catch (error) {
      throw new Error(`Error in getAllNotifications: ${error.message}`);
    }
  },

  getNotificationById: async (notificationId) => {
    try {
      const notification = await Notification.getNotificationById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }
      return notification;
    } catch (error) {
      throw new Error(`Error in getNotificationById: ${error.message}`);
    }
  },

  createNotification: async (notificationData) => {
    try {
      return await Notification.createNotification(notificationData);
    } catch (error) {
      throw new Error(`Error in createNotification: ${error.message}`);
    }
  },

  updateNotification: async (notificationId, notificationData) => {
    try {
      const updatedNotification = await Notification.updateNotification(notificationId, notificationData);
      if (!updatedNotification) {
        throw new Error('Notification not found');
      }
      return updatedNotification;
    } catch (error) {
      throw new Error(`Error in updateNotification: ${error.message}`);
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const deleted = await Notification.deleteNotification(notificationId);
      if (!deleted) {
        throw new Error('Notification not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Error in deleteNotification: ${error.message}`);
    }
  },

  getNotificationsByRecipient: async (recipientId, recipientType) => {
    try {
      return await Notification.getNotificationsByRecipient(recipientId, recipientType);
    } catch (error) {
      throw new Error(`Error in getNotificationsByRecipient: ${error.message}`);
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const marked = await Notification.markAsRead(notificationId);
      if (!marked) {
        throw new Error('Notification not found');
      }
      return marked;
    } catch (error) {
      throw new Error(`Error in markAsRead: ${error.message}`);
    }
  },

  markAllAsRead: async (recipientId, recipientType) => {
    try {
      return await Notification.markAllAsRead(recipientId, recipientType);
    } catch (error) {
      throw new Error(`Error in markAllAsRead: ${error.message}`);
    }
  },

  getUnreadCount: async (recipientId, recipientType) => {
    try {
      return await Notification.getUnreadCount(recipientId, recipientType);
    } catch (error) {
      throw new Error(`Error in getUnreadCount: ${error.message}`);
    }
  }
};

module.exports = notificationService; 