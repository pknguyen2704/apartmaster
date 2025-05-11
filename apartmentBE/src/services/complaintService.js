const Complaint = require('../models/complaintModel');

const complaintService = {
  getAllComplaints: async () => {
    try {
      return await Complaint.getAllComplaints();
    } catch (error) {
      throw new Error(`Error in getAllComplaints: ${error.message}`);
    }
  },

  getComplaintById: async (complaintId) => {
    try {
      const complaint = await Complaint.getComplaintById(complaintId);
      if (!complaint) {
        throw new Error('Complaint not found');
      }
      return complaint;
    } catch (error) {
      throw new Error(`Error in getComplaintById: ${error.message}`);
    }
  },

  createComplaint: async (complaintData) => {
    try {
      return await Complaint.createComplaint(complaintData);
    } catch (error) {
      throw new Error(`Error in createComplaint: ${error.message}`);
    }
  },

  updateComplaint: async (complaintId, complaintData) => {
    try {
      const updatedComplaint = await Complaint.updateComplaint(complaintId, complaintData);
      if (!updatedComplaint) {
        throw new Error('Complaint not found');
      }
      return updatedComplaint;
    } catch (error) {
      throw new Error(`Error in updateComplaint: ${error.message}`);
    }
  },

  deleteComplaint: async (complaintId) => {
    try {
      const deleted = await Complaint.deleteComplaint(complaintId);
      if (!deleted) {
        throw new Error('Complaint not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Error in deleteComplaint: ${error.message}`);
    }
  },

  getComplaintsByResident: async (residentId) => {
    try {
      return await Complaint.getComplaintsByResident(residentId);
    } catch (error) {
      throw new Error(`Error in getComplaintsByResident: ${error.message}`);
    }
  },

  getComplaintsByDepartment: async (departmentId) => {
    try {
      return await Complaint.getComplaintsByDepartment(departmentId);
    } catch (error) {
      throw new Error(`Error in getComplaintsByDepartment: ${error.message}`);
    }
  },

  assignDepartment: async (complaintId, departmentId) => {
    try {
      const assigned = await Complaint.assignDepartment(complaintId, departmentId);
      if (!assigned) {
        throw new Error('Complaint not found');
      }
      return assigned;
    } catch (error) {
      throw new Error(`Error in assignDepartment: ${error.message}`);
    }
  },

  updateStatus: async (complaintId, status) => {
    try {
      const validStatuses = ['Chờ xử lý', 'Đã tiếp nhận', 'Đang xử lý', 'Hoàn thành', 'Đã hủy'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
      }
      const updated = await Complaint.updateStatus(complaintId, status);
      if (!updated) {
        throw new Error('Complaint not found');
      }
      return updated;
    } catch (error) {
      throw new Error(`Error in updateStatus: ${error.message}`);
    }
  }
};

module.exports = complaintService;
