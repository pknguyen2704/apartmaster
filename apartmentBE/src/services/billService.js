const db = require('../config/database');

const BillService = {
  getAllBills: async () => {
    const [bills] = await db.query(`
      SELECT b.*, a.code as apartmentCode 
      FROM Bill b
      JOIN Apartment a ON b.apartmentId = a.apartmentId
      WHERE b.isDeleted = false
      ORDER BY b.createdAt DESC
    `);
    return bills;
  },

  calculateBill: async (apartmentId, month) => {
    // Lấy thông tin phí của căn hộ
    const [apartmentFees] = await db.query(`
      SELECT af.*, f.price, f.name as feeName
      FROM Apartment_Fee af
      JOIN Fee f ON af.feeId = f.feeId
      WHERE af.apartmentId = ? AND af.isDeleted = false
    `, [apartmentId]);

    if (!apartmentFees.length) {
      throw new Error('Không tìm thấy thông tin phí của căn hộ');
    }

    // Tính tổng tiền
    let totalMoney = 0;
    const feeDetails = apartmentFees.map(fee => {
      const amount = fee.amount * fee.price;
      totalMoney += amount;
      return {
        feeId: fee.feeId,
        feeName: fee.feeName,
        amount: fee.amount,
        price: fee.price,
        total: amount
      };
    });

    // Kiểm tra xem đã có hóa đơn cho tháng này chưa
    const [existingBill] = await db.query(`
      SELECT * FROM Bill 
      WHERE apartmentId = ? AND month = ? AND isDeleted = false
    `, [apartmentId, month]);

    if (existingBill.length > 0) {
      // Cập nhật hóa đơn hiện có
      await db.query(`
        UPDATE Bill 
        SET money = ?, feeDetails = ?
        WHERE billId = ?
      `, [totalMoney, JSON.stringify(feeDetails), existingBill[0].billId]);

      return {
        ...existingBill[0],
        money: totalMoney,
        feeDetails
      };
    } else {
      // Tạo hóa đơn mới
      const [result] = await db.query(`
        INSERT INTO Bill (apartmentId, month, money, feeDetails, isPaid)
        VALUES (?, ?, ?, ?, false)
      `, [apartmentId, month, totalMoney, JSON.stringify(feeDetails)]);

      return {
        billId: result.insertId,
        apartmentId,
        month,
        money: totalMoney,
        feeDetails,
        isPaid: false
      };
    }
  },

  updateBillPayment: async (billId, paymentData) => {
    const [result] = await db.query(`
      UPDATE Bill 
      SET isPaid = ?, paymentMethod = ?
      WHERE billId = ? AND isDeleted = false
    `, [paymentData.isPaid, paymentData.paymentMethod, billId]);

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy hóa đơn hoặc hóa đơn đã bị xóa');
    }

    return { billId, ...paymentData };
  },

  deleteBill: async (billId) => {
    const [result] = await db.query(`
      UPDATE Bill 
      SET isDeleted = true
      WHERE billId = ? AND isDeleted = false
    `, [billId]);

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy hóa đơn hoặc hóa đơn đã bị xóa');
    }

    return { message: 'Xóa hóa đơn thành công' };
  }
};

module.exports = BillService; 