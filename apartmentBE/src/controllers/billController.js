const BillService = require('../services/billService');

const BillController = {
  getAllBills: async (req, res, next) => {
    try {
      const bills = await BillService.getAllBills();
      res.json({
        success: true,
        data: bills
      });
    } catch (error) {
      next(error);
    }
  },

  calculateBill: async (req, res, next) => {
    try {
      const { apartmentId, month } = req.body;
      const result = await BillService.calculateBill(apartmentId, month);
      res.json({
        success: true,
        message: 'Tính hóa đơn thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  updateBillPayment: async (req, res, next) => {
    try {
      const { billId } = req.params;
      const paymentData = req.body;
      const result = await BillService.updateBillPayment(billId, paymentData);
      res.json({
        success: true,
        message: 'Cập nhật trạng thái thanh toán thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  deleteBill: async (req, res, next) => {
    try {
      const { billId } = req.params;
      const result = await BillService.deleteBill(billId);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = BillController; 