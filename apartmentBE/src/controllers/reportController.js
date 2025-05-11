const ReportService = require('../services/reportService');

class ReportController {
  // Get all reports
  static async getAllReports(req, res) {
    try {
      const reports = await ReportService.getAllReports();
      res.json({
        success: true,
        message: 'Lấy danh sách báo cáo thành công',
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lấy danh sách báo cáo',
        error: error.message
      });
    }
  }

  // Create new report
  static async createReport(req, res) {
    try {
      const reportData = {
        ...req.body,
        employeeId: req.user.employeeId // Get employeeId from authenticated user
      };
      const report = await ReportService.createReport(reportData);
      res.status(201).json({
        success: true,
        message: 'Tạo báo cáo thành công',
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi tạo báo cáo',
        error: error.message
      });
    }
  }

  // Update report
  static async updateReport(req, res) {
    try {
      const { id } = req.params;
      const report = await ReportService.updateReport(id, req.body);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy báo cáo'
        });
      }
      res.json({
        success: true,
        message: 'Cập nhật báo cáo thành công',
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi cập nhật báo cáo',
        error: error.message
      });
    }
  }

  // Delete report
  static async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const result = await ReportService.deleteReport(id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy báo cáo'
        });
      }
      res.json({
        success: true,
        message: 'Xóa báo cáo thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi xóa báo cáo',
        error: error.message
      });
    }
  }

  // Get reports by employee ID
  static async getReportsByEmployeeId(req, res) {
    try {
      const { employeeId } = req.params;
      const reports = await ReportService.getReportsByEmployeeId(employeeId);
      res.json({
        success: true,
        message: 'Lấy danh sách báo cáo theo nhân viên thành công',
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lấy danh sách báo cáo theo nhân viên',
        error: error.message
      });
    }
  }
}

module.exports = ReportController; 