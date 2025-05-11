const pool = require('../config/database');

class ReportService {
  // Get all reports
  static async getAllReports() {
    try {
      const query = `
        SELECT r.*, e.fullName as employeeName
        FROM reports r
        LEFT JOIN employees e ON r.employeeId = e.employeeId
        WHERE r.isDeleted = FALSE
        ORDER BY r.createdAt DESC
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw new Error('Error getting reports: ' + error.message);
    }
  }

  // Create new report
  static async createReport(reportData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { content, employeeId, reportType } = reportData;
      
      // Validate employee exists
      const [employee] = await connection.query(
        'SELECT employeeId FROM employees WHERE employeeId = ? AND isDeleted = FALSE',
        [employeeId]
      );

      if (!employee.length) {
        throw new Error('Nhân viên không tồn tại');
      }

      const query = `
        INSERT INTO reports (content, employeeId, reportType, createdAt, updatedAt)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      const [result] = await connection.query(query, [content, employeeId, reportType]);

      const [newReport] = await connection.query(
        'SELECT r.*, e.fullName as employeeName FROM reports r LEFT JOIN employees e ON r.employeeId = e.employeeId WHERE r.reportId = ?',
        [result.insertId]
      );

      await connection.commit();
      return newReport[0];
    } catch (error) {
      await connection.rollback();
      throw new Error('Error creating report: ' + error.message);
    } finally {
      connection.release();
    }
  }

  // Update report
  static async updateReport(id, reportData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { content, employeeId, reportType } = reportData;

      // Validate report exists
      const [report] = await connection.query(
        'SELECT reportId FROM reports WHERE reportId = ? AND isDeleted = FALSE',
        [id]
      );

      if (!report.length) {
        throw new Error('Báo cáo không tồn tại');
      }

      // Validate employee exists
      const [employee] = await connection.query(
        'SELECT employeeId FROM employees WHERE employeeId = ? AND isDeleted = FALSE',
        [employeeId]
      );

      if (!employee.length) {
        throw new Error('Nhân viên không tồn tại');
      }

      const query = `
        UPDATE reports 
        SET content = ?, employeeId = ?, reportType = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE reportId = ? AND isDeleted = FALSE
      `;
      await connection.query(query, [content, employeeId, reportType, id]);

      const [updatedReport] = await connection.query(
        'SELECT r.*, e.fullName as employeeName FROM reports r LEFT JOIN employees e ON r.employeeId = e.employeeId WHERE r.reportId = ?',
        [id]
      );

      await connection.commit();
      return updatedReport[0];
    } catch (error) {
      await connection.rollback();
      throw new Error('Error updating report: ' + error.message);
    } finally {
      connection.release();
    }
  }

  // Delete report (soft delete)
  static async deleteReport(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const query = `
        UPDATE reports
        SET isDeleted = TRUE, updatedAt = CURRENT_TIMESTAMP
        WHERE reportId = ? AND isDeleted = FALSE
      `;
      const [result] = await connection.query(query, [id]);

      if (result.affectedRows === 0) {
        throw new Error('Báo cáo không tồn tại');
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw new Error('Error deleting report: ' + error.message);
    } finally {
      connection.release();
    }
  }

  // Get reports by employee ID
  static async getReportsByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT r.*, e.fullName as employeeName
        FROM reports r
        LEFT JOIN employees e ON r.employeeId = e.employeeId
        WHERE r.employeeId = ? AND r.isDeleted = FALSE
        ORDER BY r.createdAt DESC
      `;
      const [rows] = await pool.query(query, [employeeId]);
      return rows;
    } catch (error) {
      throw new Error('Error getting reports by employee: ' + error.message);
    }
  }
}

module.exports = ReportService; 