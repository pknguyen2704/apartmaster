const Joi = require('joi');

const residentBaseSchema = {
  fullName: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Họ tên phải có ít nhất {#limit} ký tự.',
    'any.required': 'Họ tên là bắt buộc.'
  }),
  birthDate: Joi.date().iso().optional().allow(null, '').messages({
    'date.format': 'Ngày sinh phải theo định dạng YYYY-MM-DD.'
  }),
  gender: Joi.string().valid('Nam', 'Nữ', 'Khác').optional().allow(null, '').messages({
    'any.only': 'Giới tính phải là Nam, Nữ, hoặc Khác.'
  }),
  idNumber: Joi.string().pattern(/^[0-9]{12}$/).required().messages({
    'string.pattern.base': 'Số CMND/CCCD phải là 12 chữ số.',
    'any.required': 'Số CMND/CCCD là bắt buộc.'
  }),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional().allow(null, '').messages({
    'string.pattern.base': 'Số điện thoại phải từ 10 đến 11 chữ số.'
  }),
  email: Joi.string().email().optional().allow(null, '').messages({
    'string.email': 'Email không hợp lệ.'
  }),
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Tên đăng nhập chỉ được chứa chữ và số.',
    'string.min': 'Tên đăng nhập phải có ít nhất {#limit} ký tự.',
    'any.required': 'Tên đăng nhập là bắt buộc.'
  }),
  status: Joi.number().integer().optional(),
  roleId: Joi.number().integer().positive().required().messages({
      'any.required': 'ID Vai trò là bắt buộc.',
      'number.base': 'ID Vai trò phải là số.',
  })
};

const createResidentSchema = Joi.object({
  ...residentBaseSchema,
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự.',
    'any.required': 'Mật khẩu là bắt buộc.'
  })
});

const updateResidentSchema = Joi.object({
  ...residentBaseSchema,
  password: Joi.string().min(6).optional().allow(null, '').messages({
    'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự.'
  })
}).min(1); // Ít nhất một trường để cập nhật

module.exports = {
  createResidentSchema,
  updateResidentSchema
}; 