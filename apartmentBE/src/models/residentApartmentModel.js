const db = require('../config/database');

const ResidentApartment = {
  // Gán cư dân vào căn hộ
  assignResidentToApartment: async (data) => {
    const { residentId, apartmentId, isOwner, moveInDate } = data;
    try {
      console.log('Starting apartment assignment with data:', data);

      // Kiểm tra xem cặp (residentId, apartmentId) với moveOutDate = NULL đã tồn tại chưa
      const [existingActive] = await db.query(
        'SELECT * FROM Resident_Apartment WHERE residentId = ? AND apartmentId = ? AND moveOutDate IS NULL AND isDeleted = FALSE',
        [residentId, apartmentId]
      );
      console.log('Existing active assignments:', existingActive);

      if (existingActive.length > 0) {
        throw new Error('Resident is already actively assigned to this apartment.');
      }

      // Thêm bản ghi mới vào Resident_Apartment
      const query = `
        INSERT INTO Resident_Apartment 
        (residentId, apartmentId, isOwner, moveInDate, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      const values = [residentId, apartmentId, isOwner, moveInDate];
      console.log('Executing query:', query, 'with values:', values);

      const [result] = await db.query(query, values);
      console.log('Query result:', result);

      if (result.affectedRows === 0) {
        throw new Error('Failed to assign resident to apartment');
      }

      // Lấy bản ghi vừa thêm để kiểm tra
      const [newAssignment] = await db.query(
        `SELECT ra.*, a.code as apartmentCode, a.building, a.floor, a.area 
         FROM Resident_Apartment ra
         JOIN Apartment a ON ra.apartmentId = a.apartmentId
         WHERE ra.residentId = ? AND ra.apartmentId = ? 
         ORDER BY ra.createdAt DESC LIMIT 1`,
        [residentId, apartmentId]
      );
      console.log('New assignment record:', newAssignment);

      if (!newAssignment || newAssignment.length === 0) {
        throw new Error('Failed to retrieve newly created assignment');
      }

      return { 
        residentId, 
        apartmentId, 
        isOwner, 
        moveInDate, 
        id: result.insertId,
        assignment: newAssignment[0]
      };
    } catch (error) {
      console.error('Error in assignResidentToApartment:', error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid residentId or apartmentId.');
      }
      throw error;
    }
  },

  // Cập nhật thông tin (ví dụ: set moveOutDate, thay đổi isOwner)
  updateAssignment: async (residentId, apartmentId, updateData) => {
    const { isOwner, moveInDate, moveOutDate } = updateData;
    // Chỉ cho phép cập nhật các trường này cho một bản ghi cụ thể (thường là bản ghi active nhất)
    // Logic tìm bản ghi active nhất (moveOutDate IS NULL) cho cặp (residentId, apartmentId) cần được xác định rõ.
    // Ví dụ đơn giản: cập nhật bản ghi gần nhất chưa có moveOutDate
    try {
      const [result] = await db.query(
        'UPDATE Resident_Apartment SET isOwner = ?, moveInDate = ?, moveOutDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE residentId = ? AND apartmentId = ? AND moveOutDate IS NULL AND isDeleted = FALSE ORDER BY createdAt DESC LIMIT 1',
        [isOwner, moveInDate, moveOutDate, residentId, apartmentId]
      );
      if (result.affectedRows === 0) {
        throw new Error('No active assignment found for this resident and apartment to update, or no changes made.');
      }
      return { residentId, apartmentId, ...updateData };
    } catch (error) {
      console.error('Error updating resident-apartment assignment:', error);
      throw error;
    }
  },
  
  // Cập nhật moveOutDate cho một mối quan hệ cụ thể (khi cư dân rời đi)
  setMoveOutDate: async (residentId, apartmentId, moveOutDate) => {
    try {
        const [result] = await db.query(
            'UPDATE Resident_Apartment SET moveOutDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE residentId = ? AND apartmentId = ? AND moveOutDate IS NULL AND isDeleted = FALSE',
            [moveOutDate, residentId, apartmentId]
        );
        if (result.affectedRows === 0) {
            throw new Error('No active assignment found for this resident and apartment to set move out date.');
        }
        return { message: 'Move out date set successfully.' };
    } catch (error) {
        console.error('Error setting move out date:', error);
        throw error;
    }
  },

  // Lấy căn hộ hiện tại của một cư dân
  getApartmentsByResident: async (residentId) => {
    try {
      const query = `
        SELECT 
          ra.residentId, ra.apartmentId, ra.isOwner, ra.moveInDate, ra.moveOutDate,
          a.code as apartmentCode, a.building, a.floor, a.area
        FROM Resident_Apartment ra
        JOIN Apartment a ON ra.apartmentId = a.apartmentId
        WHERE ra.residentId = ? 
          AND ra.isDeleted = FALSE 
          AND a.isDeleted = FALSE
          AND (ra.moveOutDate IS NULL OR ra.moveOutDate > CURRENT_DATE)
        ORDER BY ra.moveInDate DESC
      `;
      const [rows] = await db.query(query, [residentId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching apartments for resident ${residentId}:`, error);
      throw error;
    }
  },

  // Lấy tất cả cư dân của một căn hộ (bao gồm cả lịch sử và hiện tại)
  getResidentsByApartment: async (apartmentId) => {
    try {
      const query = `
        SELECT 
          ra.residentId, ra.apartmentId, ra.isOwner, ra.moveInDate, ra.moveOutDate,
          r.fullName as residentName, r.phone as residentPhone, r.email as residentEmail
        FROM Resident_Apartment ra
        JOIN Resident r ON ra.residentId = r.residentId
        WHERE ra.apartmentId = ? AND ra.isDeleted = FALSE AND r.isDeleted = FALSE
        ORDER BY ra.moveInDate DESC
      `;
      const [rows] = await db.query(query, [apartmentId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching residents for apartment ${apartmentId}:`, error);
      throw error;
    }
  },
  
  // Lấy thông tin cụ thể của một assignment
  getSpecificAssignment: async (residentId, apartmentId) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM Resident_Apartment WHERE residentId = ? AND apartmentId = ? AND moveOutDate IS NULL AND isDeleted = FALSE',
        [residentId, apartmentId]
      );
      return rows[0]; // Trả về bản ghi active hiện tại
    } catch (error) {
      console.error('Error fetching specific assignment:', error);
      throw error;
    }
  },

  assignApartment: async (residentId, apartmentId, isOwner) => {
    try {
      // Kiểm tra xem căn hộ đã có chủ hộ chưa nếu isOwner = true
      if (isOwner) {
        const [existingOwner] = await db.query(
          `SELECT * FROM Resident_Apartment 
           WHERE apartmentId = ? AND isOwner = 1 AND isDeleted = FALSE`,
          [apartmentId]
        );
        if (existingOwner.length > 0) {
          throw new Error('Căn hộ này đã có chủ hộ');
        }
      }

      // Thêm bản ghi mới vào Resident_Apartment
      const [result] = await db.query(
        `INSERT INTO Resident_Apartment 
         (residentId, apartmentId, isOwner, moveInDate) 
         VALUES (?, ?, ?, CURRENT_DATE)`,
        [residentId, apartmentId, isOwner ? 1 : 0]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error assigning apartment:', error);
      throw error;
    }
  },

  getApartmentByCode: async (code) => {
    try {
      console.log('Looking up apartment with code:', code);
      const [rows] = await db.query(
        `SELECT apartmentId, code FROM Apartment 
         WHERE code = ? AND isDeleted = FALSE`,
        [code]
      );
      console.log('Found apartment:', rows[0]);
      return rows[0];
    } catch (error) {
      console.error('Error in getApartmentByCode:', error);
      throw error;
    }
  }
};

module.exports = ResidentApartment; 