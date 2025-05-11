const Joi = require('joi');

const createReportSchema = Joi.object({
  content: Joi.string().required().messages({
    'string.empty': 'Nội dung báo cáo không được để trống',
    'any.required': 'Vui lòng nhập nội dung báo cáo'
  }),
  reportType: Joi.string().valid('Tổng hợp', 'Tài chính', 'Cư dân', 'Công việc').required().messages({
    'string.empty': 'Loại báo cáo không được để trống',
    'any.only': 'Loại báo cáo không hợp lệ',
    'any.required': 'Vui lòng chọn loại báo cáo'
  }),
  employeeId: Joi.number().required().messages({
    'number.base': 'ID nhân viên không hợp lệ',
    'any.required': 'Vui lòng chọn người tạo báo cáo'
  })
});

const updateReportSchema = Joi.object({
  content: Joi.string().required().messages({
    'string.empty': 'Nội dung báo cáo không được để trống',
    'any.required': 'Vui lòng nhập nội dung báo cáo'
  }),
  reportType: Joi.string().valid('Tổng hợp', 'Tài chính', 'Cư dân', 'Công việc').required().messages({
    'string.empty': 'Loại báo cáo không được để trống',
    'any.only': 'Loại báo cáo không hợp lệ',
    'any.required': 'Vui lòng chọn loại báo cáo'
  }),
  employeeId: Joi.number().required().messages({
    'number.base': 'ID nhân viên không hợp lệ',
    'any.required': 'Vui lòng chọn người tạo báo cáo'
  })
});

module.exports = {
  createReportSchema,
  updateReportSchema
}; 