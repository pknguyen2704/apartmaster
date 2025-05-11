const RAService = require('../services/residentApartmentService');

const ResidentApartmentController = {
  assignResidentToApartment: async (req, res, next) => {
    try {
      const assignment = await RAService.assignResidentToApartment(req.body);
      res.status(201).json({ success: true, data: assignment, message: 'Resident assigned to apartment successfully.' });
    } catch (error) {
      next(error);
    }
  },

  updateAssignment: async (req, res, next) => {
    try {
      const { residentId, apartmentId } = req.params; // Lấy ID từ params
      // Validate IDs
      if (isNaN(parseInt(residentId)) || isNaN(parseInt(apartmentId))){
        const err = new Error('residentId and apartmentId in URL must be numbers.');
        err.statusCode = 400;
        return next(err);
      }
      const updatedAssignment = await RAService.updateAssignment(parseInt(residentId), parseInt(apartmentId), req.body);
      res.status(200).json({ success: true, data: updatedAssignment, message: 'Assignment updated successfully.' });
    } catch (error) {
      next(error);
    }
  },
  
  setMoveOutDate: async (req, res, next) => {
    try {
        const { residentId, apartmentId } = req.params;
        const { moveOutDate } = req.body;
        if (isNaN(parseInt(residentId)) || isNaN(parseInt(apartmentId))){
            const err = new Error('residentId and apartmentId in URL must be numbers.');
            err.statusCode = 400;
            return next(err);
        }
        const result = await RAService.setMoveOutDate(parseInt(residentId), parseInt(apartmentId), moveOutDate);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
  },

  getApartmentsByResident: async (req, res, next) => {
    try {
      const { residentId } = req.params;
      if (isNaN(parseInt(residentId))){
        const err = new Error('residentId must be a number.');
        err.statusCode = 400;
        return next(err);
      }
      const apartments = await RAService.getApartmentsByResident(parseInt(residentId));
      res.status(200).json({ success: true, data: apartments });
    } catch (error) {
      next(error);
    }
  },

  getResidentsByApartment: async (req, res, next) => {
    try {
      const { apartmentId } = req.params;
      if (isNaN(parseInt(apartmentId))){
        const err = new Error('apartmentId must be a number.');
        err.statusCode = 400;
        return next(err);
      }
      const residents = await RAService.getResidentsByApartment(parseInt(apartmentId));
      res.status(200).json({ success: true, data: residents });
    } catch (error) {
      next(error);
    }
  },
  
  getSpecificAssignment: async (req, res, next) => {
    try {
        const { residentId, apartmentId } = req.params;
        if (isNaN(parseInt(residentId)) || isNaN(parseInt(apartmentId))){
            const err = new Error('residentId and apartmentId must be numbers.');
            err.statusCode = 400;
            return next(err);
        }
        const assignment = await RAService.getSpecificAssignment(parseInt(residentId), parseInt(apartmentId));
        if (!assignment) {
            const err = new Error('Active assignment not found.');
            err.statusCode = 404;
            return next(err);
        }
        res.status(200).json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
  }
};

module.exports = ResidentApartmentController; 