import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import jsPDF from 'jspdf';

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/reports');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Fetch reports error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Có lỗi xảy ra khi tải danh sách báo cáo'
      );
    }
  }
);

export const createReport = createAsyncThunk(
  'reports/createReport',
  async (reportData, { rejectWithValue }) => {
    try {
      // Validate required fields
      if (!reportData.employeeId) {
        throw new Error('Vui lòng chọn người tạo báo cáo');
      }
      if (!reportData.reportType) {
        throw new Error('Vui lòng chọn loại báo cáo');
      }
      if (!reportData.content) {
        throw new Error('Vui lòng nhập nội dung báo cáo');
      }

      const response = await axios.post('/api/reports', reportData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create report error:', error.response?.data || error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message ||
        'Có lỗi xảy ra khi tạo báo cáo'
      );
    }
  }
);

export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Validate required fields
      if (!data.employeeId) {
        throw new Error('Vui lòng chọn người tạo báo cáo');
      }
      if (!data.reportType) {
        throw new Error('Vui lòng chọn loại báo cáo');
      }
      if (!data.content) {
        throw new Error('Vui lòng nhập nội dung báo cáo');
      }

      const response = await axios.put(`/api/reports/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update report error:', error.response?.data || error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message ||
        'Có lỗi xảy ra khi cập nhật báo cáo'
      );
    }
  }
);

export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/reports/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Delete report error:', error.response?.data || error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message ||
        'Có lỗi xảy ra khi xóa báo cáo'
      );
    }
  }
);

export const generatePDF = createAsyncThunk(
  'reports/generatePDF',
  async (report, { rejectWithValue }) => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('BÁO CÁO CHUNG CƯ', 105, 20, { align: 'center' });
      
      // Add report type
      doc.setFontSize(14);
      doc.text(report.reportType, 105, 30, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Ngày tạo: ${new Date(report.createdAt).toLocaleDateString('vi-VN')}`, 20, 40);
      
      // Add content
      doc.setFontSize(11);
      const splitContent = doc.splitTextToSize(report.content, 170);
      doc.text(splitContent, 20, 50);
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Trang ${i} / ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      doc.save(`bao-cao-${report.reportId}.pdf`);
      return true;
    } catch (error) {
      console.error('Generate PDF error:', error);
      return rejectWithValue('Có lỗi xảy ra khi tạo file PDF');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  success: false,
  pdfGenerating: false
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update report
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.reportId === action.payload.reportId);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete report
      .addCase(deleteReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.reportId !== action.payload.reportId);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Generate PDF
      .addCase(generatePDF.pending, (state) => {
        state.pdfGenerating = true;
        state.error = null;
      })
      .addCase(generatePDF.fulfilled, (state) => {
        state.pdfGenerating = false;
        state.error = null;
      })
      .addCase(generatePDF.rejected, (state, action) => {
        state.pdfGenerating = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess } = reportSlice.actions;
export default reportSlice.reducer; 