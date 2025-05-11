const RAModel = require('../models/residentApartmentModel');

const ResidentApartmentService = {
  assignResidentToApartment: async (data) => {
    return RAModel.assignResidentToApartment(data);
  },

  updateAssignment: async (residentId, apartmentId, updateData) => {
    return RAModel.updateAssignment(residentId, apartmentId, updateData);
  },
  
  setMoveOutDate: async (residentId, apartmentId, moveOutDate) => {
    return RAModel.setMoveOutDate(residentId, apartmentId, moveOutDate);
  },

  getApartmentsByResident: async (residentId) => {
    return RAModel.getApartmentsByResident(residentId);
  },

  getResidentsByApartment: async (apartmentId) => {
    return RAModel.getResidentsByApartment(apartmentId);
  },
  
  getSpecificAssignment: async (residentId, apartmentId) => {
      return RAModel.getSpecificAssignment(residentId, apartmentId);
  }
};

module.exports = ResidentApartmentService; 