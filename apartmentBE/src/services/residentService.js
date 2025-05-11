const ResidentModel = require('../models/residentModel');
const ResidentApartment = require('../models/residentApartmentModel');
// const bcrypt = require('bcryptjs');

const ResidentService = {
  getAllResidents: async () => {
    try {
      // Lấy danh sách cư dân
      const residents = await ResidentModel.getAll();
      
      // Lấy thông tin căn hộ cho từng cư dân
      const residentsWithApartments = await Promise.all(
        residents.map(async (resident) => {
          const apartments = await ResidentApartment.getApartmentsByResident(resident.residentId);
          return {
            ...resident,
            apartments
          };
        })
      );

      return residentsWithApartments;
    } catch (error) {
      console.error('Error in getAllResidents:', error);
      throw error;
    }
  },

  getResidentById: async (id) => {
    return ResidentModel.getById(id);
  },

  createResident: async (residentData) => {
    try {
      // Tạo cư dân mới
      const newResident = await ResidentModel.create(residentData);
      
      // Nếu có mã căn hộ, lấy thông tin căn hộ
      if (residentData.apartmentCode) {
        const apartments = await ResidentApartment.getApartmentsByResident(newResident.residentId);
        return {
          ...newResident,
          apartments
        };
    }

      return newResident;
    } catch (error) {
      console.error('Error in createResident:', error);
      throw error;
    }
  },

  updateResident: async (id, residentData) => {
    // delete residentData.password; // Không cho cập nhật password ở đây
    return ResidentModel.update(id, residentData);
  },

  deleteResident: async (id) => {
    return ResidentModel.softDelete(id);
  },

  async findByIdNumber(idNumber) {
    try {
      const resident = await ResidentModel.findByIdNumber(idNumber);
      if (!resident) {
        throw new Error('Không tìm thấy cư dân với số CMND/CCCD này');
      }
      return resident;
    } catch (error) {
      throw error;
    }
  },

  async getResidentsByServiceId(serviceId) {
    try {
      const residents = await ResidentModel.getResidentsByServiceId(serviceId);
      if (!residents || residents.length === 0) {
        throw new Error('Không tìm thấy cư dân nào đăng ký dịch vụ này');
      }
      return residents;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = ResidentService; 