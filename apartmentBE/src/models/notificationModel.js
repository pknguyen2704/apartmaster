const db = require('../config/database');

const Notification = {
  createNotification: async (notificationData) => {
    const { title, content, status, employeeId } = notificationData;
    try {
      const [result] = await db.query(
        'INSERT INTO Notification (title, content, status, employeeId) VALUES (?, ?, ?, ?)',
        [title, content, status, employeeId]
      );
      return { id: result.insertId, ...notificationData };
    } catch (error) {
      throw error;
    }
  },

  getAllNotifications: async () => {
    const [rows] = await db.query(`
      SELECT 
        n.notificationId, n.title, n.content, n.status,
        n.employeeId, n.createdAt, n.updatedAt, n.isDeleted,
        e.fullName as employeeName
      FROM Notification n
      LEFT JOIN Employee e ON n.employeeId = e.employeeId
      WHERE n.isDeleted = FALSE
      ORDER BY n.createdAt DESC
    `);
    return rows.map(row => ({
      notificationId: row.notificationId,
      title: row.title,
      content: row.content,
      status: row.status,
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  },

  getNotificationById: async (notificationId) => {
    const [rows] = await db.query(`
      SELECT 
        n.notificationId, n.title, n.content, n.status,
        n.employeeId, n.createdAt, n.updatedAt, n.isDeleted,
        e.fullName as employeeName
      FROM Notification n
      LEFT JOIN Employee e ON n.employeeId = e.employeeId
      WHERE n.notificationId = ? AND n.isDeleted = FALSE
    `, [notificationId]);

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      notificationId: row.notificationId,
      title: row.title,
      content: row.content,
      status: row.status,
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  },

  updateNotification: async (notificationId, notificationData) => {
    const { title, content, status } = notificationData;
    try {
      const [result] = await db.query(
        'UPDATE Notification SET title = ?, content = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE notificationId = ? AND isDeleted = FALSE',
        [title, content, status, notificationId]
      );
      if (result.affectedRows === 0) {
        return null;
      }
      return { id: notificationId, ...notificationData };
    } catch (error) {
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    const [result] = await db.query(
      'UPDATE Notification SET isDeleted = TRUE, updatedAt = CURRENT_TIMESTAMP WHERE notificationId = ? AND isDeleted = FALSE',
      [notificationId]
    );
    return result.affectedRows > 0;
  },

  getNotificationsByEmployee: async (employeeId) => {
    const [rows] = await db.query(`
      SELECT 
        n.notificationId, n.title, n.content, n.status,
        n.employeeId, n.createdAt, n.updatedAt,
        e.fullName as employeeName
      FROM Notification n
      LEFT JOIN Employee e ON n.employeeId = e.employeeId
      WHERE n.employeeId = ? AND n.isDeleted = FALSE
      ORDER BY n.createdAt DESC
    `, [employeeId]);
    return rows.map(row => ({
      notificationId: row.notificationId,
      title: row.title,
      content: row.content,
      status: row.status,
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  },

  updateStatus: async (notificationId, status) => {
    const [result] = await db.query(
      'UPDATE Notification SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE notificationId = ? AND isDeleted = FALSE',
      [status, notificationId]
    );
    if (result.affectedRows === 0) {
      return null;
    }
    return { id: notificationId, status };
  }
};

module.exports = Notification; 