const ServiceModel = require('../models/serviceModel');

const ServiceService = {
  // Lấy tất cả dịch vụ
  async getAllServices() {
    try {
      return await ServiceModel.getAll();
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin một dịch vụ theo ID
  async getServiceById(id) {
    try {
      const service = await ServiceModel.getById(id);
      if (!service) {
        throw new Error('Không tìm thấy dịch vụ');
      }
      return service;
    } catch (error) {
      throw error;
    }
  },

  // Tạo dịch vụ mới
  async createService(serviceData) {
    try {
      // Kiểm tra tên dịch vụ đã tồn tại chưa
      const existingService = await ServiceModel.findByName(serviceData.name);
      if (existingService) {
        throw new Error('Service name already exists.');
      }

      // Kiểm tra feeId có tồn tại không
      const isValidFee = await ServiceModel.validateFeeId(serviceData.feeId);
      if (!isValidFee) {
        throw new Error('Invalid fee ID.');
      }

      return await ServiceModel.create(serviceData);
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin dịch vụ
  async updateService(id, serviceData) {
    try {
      // Kiểm tra dịch vụ có tồn tại không
      const existingService = await ServiceModel.getById(id);
      if (!existingService) {
        throw new Error('Không tìm thấy dịch vụ');
      }

      // Nếu có cập nhật tên, kiểm tra tên mới có bị trùng không
      if (serviceData.name && serviceData.name !== existingService.name) {
        const nameExists = await ServiceModel.findByName(serviceData.name);
        if (nameExists) {
          throw new Error('Service name already exists.');
        }
      }

      // Nếu có cập nhật feeId, kiểm tra feeId mới có hợp lệ không
      if (serviceData.feeId && serviceData.feeId !== existingService.feeId) {
        const isValidFee = await ServiceModel.validateFeeId(serviceData.feeId);
        if (!isValidFee) {
          throw new Error('Invalid fee ID.');
        }
      }

      return await ServiceModel.update(id, serviceData);
    } catch (error) {
      throw error;
    }
  },

  // Xóa dịch vụ (soft delete)
  async deleteService(id) {
    try {
      const service = await ServiceModel.getById(id);
      if (!service) {
        throw new Error('Không tìm thấy dịch vụ');
      }
      return await ServiceModel.softDelete(id);
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách cư dân đăng ký dịch vụ
  async getRegisteredResidents(serviceId) {
    try {
      // Kiểm tra dịch vụ có tồn tại không
      const service = await ServiceModel.getById(serviceId);
      if (!service) {
        throw new Error('Không tìm thấy dịch vụ');
      }

      const residents = await ServiceModel.getRegisteredResidents(serviceId);
      if (!residents || residents.length === 0) {
        throw new Error('Không tìm thấy cư dân nào đăng ký dịch vụ này');
      }
      return residents;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = ServiceService; 