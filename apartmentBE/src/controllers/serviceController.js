const ServiceService = require('../services/serviceService');

const ServiceController = {
  // Lấy tất cả dịch vụ
  async getAllServices(req, res) {
    try {
      const services = await ServiceService.getAllServices();
      res.json({
        success: true,
        data: services,
        message: 'Lấy danh sách dịch vụ thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách dịch vụ'
      });
    }
  },

  // Lấy thông tin một dịch vụ theo ID
  async getServiceById(req, res) {
    try {
      const { id } = req.params;
      const service = await ServiceService.getServiceById(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dịch vụ'
        });
      }
      res.json({
        success: true,
        data: service,
        message: 'Lấy thông tin dịch vụ thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy thông tin dịch vụ'
      });
    }
  },

  // Tạo dịch vụ mới
  async createService(req, res) {
    try {
      const serviceData = req.body;
      const newService = await ServiceService.createService(serviceData);
      res.status(201).json({
        success: true,
        data: newService,
        message: 'Tạo dịch vụ mới thành công'
      });
    } catch (error) {
      if (error.message === 'Service name already exists.') {
        return res.status(409).json({
          success: false,
          message: 'Tên dịch vụ đã tồn tại trong hệ thống',
          error: 'SERVICE_NAME_EXISTS'
        });
      }
      if (error.message === 'Invalid fee ID.') {
        return res.status(400).json({
          success: false,
          message: 'ID phí dịch vụ không hợp lệ',
          error: 'INVALID_FEE_ID'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo dịch vụ mới'
      });
    }
  },

  // Cập nhật thông tin dịch vụ
  async updateService(req, res) {
    try {
      const { id } = req.params;
      const serviceData = req.body;
      const updatedService = await ServiceService.updateService(id, serviceData);
      if (!updatedService) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dịch vụ để cập nhật'
        });
      }
      res.json({
        success: true,
        data: updatedService,
        message: 'Cập nhật dịch vụ thành công'
      });
    } catch (error) {
      if (error.message === 'Service name already exists.') {
        return res.status(409).json({
          success: false,
          message: 'Tên dịch vụ đã tồn tại trong hệ thống',
          error: 'SERVICE_NAME_EXISTS'
        });
      }
      if (error.message === 'Invalid fee ID.') {
        return res.status(400).json({
          success: false,
          message: 'ID phí dịch vụ không hợp lệ',
          error: 'INVALID_FEE_ID'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật dịch vụ'
      });
    }
  },

  // Xóa dịch vụ (soft delete)
  async deleteService(req, res) {
    try {
      const { id } = req.params;
      const success = await ServiceService.deleteService(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dịch vụ để xóa'
        });
      }
      res.json({
        success: true,
        message: 'Xóa dịch vụ thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa dịch vụ'
      });
    }
  },

  // Lấy danh sách cư dân đăng ký dịch vụ
  async getRegisteredResidents(req, res) {
    try {
      const { serviceId } = req.params;
      const residents = await ServiceService.getRegisteredResidents(serviceId);
      res.json({
        success: true,
        data: residents,
        message: 'Lấy danh sách cư dân đăng ký dịch vụ thành công'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy cư dân đăng ký dịch vụ'
      });
    }
  }
};

module.exports = ServiceController; 