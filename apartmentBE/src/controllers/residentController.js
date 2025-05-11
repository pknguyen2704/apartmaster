const ResidentService = require('../services/residentService');
const ResidentApartment = require('../models/residentApartmentModel');
const db = require('../config/database');

const ResidentController = {
  getAllResidents: async (req, res, next) => {
    try {
      const residents = await ResidentService.getAllResidents();
      res.status(200).json({ success: true, data: residents });
    } catch (error) {
      next(error);
    }
  },

  getResidentById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const resident = await ResidentService.getResidentById(id);
      if (!resident) {
        const err = new Error('Resident not found');
        err.statusCode = 404;
        return next(err);
      }
      res.status(200).json({ success: true, data: resident });
    } catch (error) {
      next(error);
    }
  },

  createResident: async (req, res, next) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      const residentData = req.body;
      const { apartmentCode, isOwner } = residentData;
      
      console.log('Creating resident with data:', { ...residentData, password: '[REDACTED]' });
      
      // Đảm bảo roleId là 6 (Cư dân)
      residentData.roleId = 6;

      // Tạo cư dân mới
      const newResident = await ResidentService.createResident(residentData);
      console.log('Created resident:', newResident);
      
      const { password, ...residentResponse } = newResident;

      // Nếu có mã căn hộ, thực hiện gán căn hộ
      if (apartmentCode) {
        try {
          console.log('Looking up apartment with code:', apartmentCode);
          // Tìm căn hộ theo mã
          const apartment = await ResidentApartment.getApartmentByCode(apartmentCode);
          console.log('Found apartment:', apartment);
          
          if (!apartment) {
            throw new Error('Không tìm thấy căn hộ với mã này');
          }

          // Kiểm tra xem căn hộ đã có chủ hộ chưa nếu isOwner = true
          if (isOwner) {
            console.log('Checking for existing owner of apartment:', apartment.apartmentId);
            const [existingOwner] = await connection.query(
              `SELECT * FROM Resident_Apartment 
               WHERE apartmentId = ? AND isOwner = 1 AND isDeleted = FALSE`,
              [apartment.apartmentId]
            );
            if (existingOwner.length > 0) {
              throw new Error('Căn hộ này đã có chủ hộ');
            }
          }

          // Gán căn hộ cho cư dân
          const assignmentData = {
            residentId: newResident.residentId,
            apartmentId: apartment.apartmentId,
            isOwner: isOwner ? 1 : 0,
            moveInDate: new Date()
          };
          console.log('Assigning apartment with data:', assignmentData);

          const assignmentResult = await ResidentApartment.assignResidentToApartment(assignmentData);
          console.log('Apartment assignment result:', assignmentResult);

          // Lấy thông tin căn hộ đã gán
          const apartments = await ResidentApartment.getApartmentsByResident(newResident.residentId);
          console.log('Retrieved apartments for resident:', apartments);
          
          residentResponse.apartments = apartments;

          await connection.commit();
          res.status(201).json({ 
            success: true, 
            data: residentResponse, 
            message: 'Resident created and assigned to apartment successfully' 
          });
        } catch (error) {
          await connection.rollback();
          console.error('Error in apartment assignment:', error);
          // Trả về lỗi nhưng vẫn cho phép tạo cư dân
          return res.status(201).json({ 
            success: true, 
            data: residentResponse,
            message: 'Resident created successfully but failed to assign apartment: ' + error.message
          });
        }
      } else {
        await connection.commit();
        res.status(201).json({ 
          success: true, 
          data: residentResponse, 
          message: 'Resident created successfully' 
        });
      }
    } catch (error) {
      await connection.rollback();
      console.error('Error in createResident:', error);
      // Xử lý các lỗi cụ thể
      if (error.message === 'ID number already exists.') {
        return res.status(409).json({
          success: false,
          message: 'Số CMND/CCCD đã tồn tại trong hệ thống.',
          error: 'ID_NUMBER_EXISTS'
        });
      }
      if (error.message === 'Email already exists.') {
        return res.status(409).json({
          success: false,
          message: 'Email đã tồn tại trong hệ thống.',
          error: 'EMAIL_EXISTS'
        });
      }
      if (error.message === 'Username already exists.') {
        return res.status(409).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại trong hệ thống.',
          error: 'USERNAME_EXISTS'
        });
      }
      if (error.message === 'Invalid roleId provided for resident.') {
        return res.status(400).json({
          success: false,
          message: 'Vai trò không hợp lệ.',
          error: 'INVALID_ROLE'
        });
      }
      // Xử lý lỗi validation
      if (error.isJoi) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: validationErrors,
          error: 'VALIDATION_ERROR'
        });
      }
      // Các lỗi khác
      next(error);
    } finally {
      connection.release();
    }
  },

  updateResident: async (req, res, next) => {
    try {
      const { id } = req.params;
      const residentData = req.body;
      // delete residentData.password; // Mật khẩu không nên cập nhật ở đây
      // Nếu cho phép cập nhật roleId, cần validate cẩn thận
      // delete residentData.roleId; 

      const updatedResident = await ResidentService.updateResident(id, residentData);
      if (!updatedResident) {
        const err = new Error('Resident not found or not updated');
        err.statusCode = 404;
        return next(err);
      }
      const { password, ...residentResponse } = updatedResident;
      res.status(200).json({ success: true, data: residentResponse, message: 'Resident updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  deleteResident: async (req, res, next) => {
    try {
      const { id } = req.params;
      const success = await ResidentService.deleteResident(id);
      if (!success) {
        const err = new Error('Resident not found or already deleted');
        err.statusCode = 404;
        return next(err);
      }
      res.status(200).json({ success: true, message: 'Resident deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async findByIdNumber(req, res) {
    try {
      const { idNumber } = req.params;
      const resident = await ResidentService.findByIdNumber(idNumber);
      res.json({
        success: true,
        data: resident,
        message: 'Tìm thấy cư dân thành công'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy cư dân'
      });
    }
  },

  async getResidentsByServiceId(req, res) {
    try {
      const { serviceId } = req.params;
      const residents = await ResidentService.getResidentsByServiceId(serviceId);
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

module.exports = ResidentController; 