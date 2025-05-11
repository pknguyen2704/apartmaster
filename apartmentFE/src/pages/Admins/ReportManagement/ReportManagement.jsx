import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  TablePagination,
  Paper,
  Chip,
  Tooltip,
  alpha,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import {
  fetchReports,
  createReport,
  updateReport,
  deleteReport,
  generatePDF,
} from '../../../redux/slices/reportSlice';
import { fetchEmployees } from '../../../redux/slices/employeeSlice';
import { fetchApartments } from '../../../redux/slices/apartmentSlice';
import { fetchBills } from '../../../redux/slices/billSlice';
import { fetchTasks } from '../../../redux/slices/taskSlice';
import { fetchResidents } from '../../../redux/slices/residentSlice';
import { fetchServices } from '../../../redux/slices/serviceSlice';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ReportManagement = () => {
  const dispatch = useDispatch();
  const { items: reports, loading, error, pdfGenerating, success } = useSelector((state) => state.reports);
  const { items: employees = [] } = useSelector((state) => state.employees);
  const { items: apartments = [] } = useSelector((state) => state.apartments);
  const { items: bills = [] } = useSelector((state) => state.bills);
  const { items: tasks = [] } = useSelector((state) => state.tasks);
  const { items: residents = [] } = useSelector((state) => state.residents);
  const { items: services = [] } = useSelector((state) => state.services);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    reportType: '',
    employeeId: '',
    dateRange: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    employeeId: '',
    reportType: 'Tổng hợp',
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [isDataLoading, setIsDataLoading] = useState(true);

  const styles = {
    pageContainer: {
      p: 3,
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      backgroundColor: 'white',
      p: 2,
      borderRadius: 2,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    searchFilterContainer: {
      mb: 3,
      p: 2,
      backgroundColor: 'white',
      borderRadius: 2,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: 2,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      '& .MuiTableHead-root': {
        backgroundColor: '#f8f9fa',
        '& .MuiTableCell-root': {
          fontWeight: 'bold',
          color: '#1976d2',
        },
      },
    },
    statusChip: {
      fontWeight: 'bold',
      '&.MuiChip-colorSuccess': {
        backgroundColor: alpha('#4caf50', 0.1),
        color: '#2e7d32',
      },
      '&.MuiChip-colorWarning': {
        backgroundColor: alpha('#ff9800', 0.1),
        color: '#f57c00',
      },
    },
    actionButton: {
      '&:hover': {
        backgroundColor: alpha('#1976d2', 0.1),
      },
    },
    dialogTitle: {
      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
      color: 'white',
      padding: '16px 24px',
    },
    formField: {
      mb: 2,
    },
    searchField: {
      backgroundColor: 'white',
      borderRadius: 1,
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'rgba(0, 0, 0, 0.23)',
        },
        '&:hover fieldset': {
          borderColor: 'rgba(0, 0, 0, 0.23)',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#1976d2',
        },
      },
    },
    addButton: {
      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
      color: 'white',
      '&:hover': {
        background: 'linear-gradient(45deg, #1565c0 30%, #2196f3 90%)',
      },
    },
    filterButton: {
      color: '#1976d2',
      '&:hover': {
        backgroundColor: alpha('#1976d2', 0.1),
      },
    },
    formSection: {
      backgroundColor: '#f8f9fa',
      p: 2,
      borderRadius: 1,
      mb: 2,
    },
    formSectionTitle: {
      color: '#1976d2',
      mb: 2,
      fontWeight: 'bold',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
    },
    tableRow: {
      '&:hover': {
        backgroundColor: alpha('#1976d2', 0.04),
      },
    },
    tableCell: {
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      color: '#1976d2',
    },
    statsCard: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      p: 2,
    },
    statsValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1976d2',
      mb: 1,
    },
    statsLabel: {
      color: 'text.secondary',
    },
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsDataLoading(true);
        await Promise.all([
          dispatch(fetchReports()),
          dispatch(fetchEmployees()),
          dispatch(fetchApartments()),
          dispatch(fetchBills()),
          dispatch(fetchTasks()),
          dispatch(fetchResidents()),
          dispatch(fetchServices())
        ]);
      } catch (error) {
        // console.error('Error loading data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const generateReportContent = () => {
    const totalApartments = apartments?.length || 0;
    const occupiedApartments = apartments?.filter(apt => apt?.status === 'Đã cho thuê')?.length || 0;
    const totalResidents = residents?.length || 0;
    const totalEmployees = employees?.length || 0;
    const totalBills = bills?.length || 0;
    const totalTasks = tasks?.length || 0;
    const totalServices = services?.length || 0;
    const completedTasks = tasks?.filter(task => task?.status === 'Hoàn thành')?.length || 0;
    const paidBills = bills?.filter(bill => bill?.isPaid)?.length || 0;

    const occupancyRate = totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const paymentRate = totalBills > 0 ? (paidBills / totalBills) * 100 : 0;
    const residentsPerApartment = occupiedApartments > 0 ? (totalResidents / occupiedApartments) : 0;

    const totalRevenue = bills?.reduce((sum, bill) => sum + (bill.money || 0), 0) || 0;
    const paidRevenue = bills?.filter(bill => bill.isPaid).reduce((sum, bill) => sum + (bill.money || 0), 0) || 0;

    return `
BÁO CÁO ${formData.reportType.toUpperCase()} CHUNG CƯ
Thời gian: ${format(new Date(), 'dd/MM/yyyy HH:mm')}

1. THÔNG TIN CHUNG
- Tổng số căn hộ: ${totalApartments}
- Số căn hộ đã cho thuê: ${occupiedApartments}
- Tỷ lệ lấp đầy: ${occupancyRate.toFixed(2)}%

2. THÔNG TIN CƯ DÂN VÀ NHÂN VIÊN
- Tổng số cư dân: ${totalResidents}
- Tổng số nhân viên: ${totalEmployees}
- Số cư dân trên căn hộ: ${residentsPerApartment.toFixed(2)}

3. THÔNG TIN TÀI CHÍNH
- Tổng số hóa đơn: ${totalBills}
- Số hóa đơn đã thanh toán: ${paidBills}
- Tỷ lệ thanh toán: ${paymentRate.toFixed(2)}%
- Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')}đ
- Doanh thu đã thu: ${paidRevenue.toLocaleString('vi-VN')}đ

4. THÔNG TIN DỊCH VỤ VÀ CÔNG VIỆC
- Tổng số dịch vụ: ${totalServices}
- Tổng số công việc: ${totalTasks}
- Số công việc hoàn thành: ${completedTasks}
- Tỷ lệ hoàn thành: ${completionRate.toFixed(2)}%

5. PHÂN TÍCH VÀ ĐỀ XUẤT
${formData.content || 'Chưa có phân tích và đề xuất'}
    `;
  };

  const handleOpenDialog = (report = null) => {
    if (report) {
      setSelectedReport(report);
      setFormData({
        content: report.content,
        employeeId: report.employeeId,
        reportType: report.reportType || 'Tổng hợp',
      });
    } else {
      setSelectedReport(null);
      setFormData({
        content: '',
        employeeId: '',
        reportType: 'Tổng hợp',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
    setFormData({
      content: '',
      employeeId: '',
      reportType: 'Tổng hợp',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isDataLoading) {
        setNotification({
          open: true,
          message: 'Đang tải dữ liệu, vui lòng thử lại sau',
          severity: 'error'
        });
        return;
      }

      // Validate required fields
      if (!formData.employeeId) {
        setNotification({
          open: true,
          message: 'Vui lòng chọn người tạo báo cáo',
          severity: 'error'
        });
        return;
      }

      if (!formData.reportType) {
        setNotification({
          open: true,
          message: 'Vui lòng chọn loại báo cáo',
          severity: 'error'
        });
        return;
      }

      const reportContent = generateReportContent();
      const reportData = {
        reportType: formData.reportType,
        content: reportContent,
        employeeId: formData.employeeId,
      };

      if (selectedReport) {
        await dispatch(updateReport({ 
          id: selectedReport.reportId, 
          data: reportData 
        })).unwrap();
        setNotification({
          open: true,
          message: 'Cập nhật báo cáo thành công',
          severity: 'success'
        });
      } else {
        await dispatch(createReport(reportData)).unwrap();
        setNotification({
          open: true,
          message: 'Tạo báo cáo thành công',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving report:', error);
      setNotification({
        open: true,
        message: error.message || 'Có lỗi xảy ra khi lưu báo cáo',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (selectedReport) {
      await dispatch(deleteReport(selectedReport.reportId)).unwrap();
      setOpenDeleteDialog(false);
      setNotification({
        open: true,
        message: 'Xóa báo cáo thành công',
        severity: 'success'
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((emp) => emp.employeeId === employeeId);
    return employee ? employee.fullName : 'Unknown';
  };

  const handleGeneratePDF = async (report) => {
    try {
      await dispatch(generatePDF(report)).unwrap();
      setNotification({
        open: true,
        message: 'Xuất PDF thành công',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Có lỗi xảy ra khi xuất PDF',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const renderStatistics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={styles.statsCard}>
          <Typography variant="h4" sx={styles.statsValue}>
            {apartments?.length || 0}
          </Typography>
          <Typography variant="body1" sx={styles.statsLabel}>
            Tổng số căn hộ
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={styles.statsCard}>
          <Typography variant="h4" sx={styles.statsValue}>
            {residents?.length || 0}
          </Typography>
          <Typography variant="body1" sx={styles.statsLabel}>
            Tổng số cư dân
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={styles.statsCard}>
          <Typography variant="h4" sx={styles.statsValue}>
            {bills?.filter(bill => bill.isPaid).length || 0}
          </Typography>
          <Typography variant="body1" sx={styles.statsLabel}>
            Hóa đơn đã thanh toán
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={styles.statsCard}>
          <Typography variant="h4" sx={styles.statsValue}>
            {tasks?.filter(task => task.status === 'Hoàn thành').length || 0}
          </Typography>
          <Typography variant="body1" sx={styles.statsLabel}>
            Công việc hoàn thành
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading || isDataLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={styles.pageContainer}>
      <Box sx={styles.header}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý báo cáo
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={styles.addButton}
          disabled={isDataLoading}
        >
          Tạo báo cáo mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderStatistics()}

      <Card>
        <TableContainer component={Paper} sx={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={styles.iconContainer}>
                    <DescriptionIcon />
                    <Typography>Loại báo cáo</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={styles.iconContainer}>
                    <PersonIcon />
                    <Typography>Người tạo</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={styles.iconContainer}>
                    <DescriptionIcon />
                    <Typography>Nội dung</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={styles.iconContainer}>
                    <AssignmentIcon />
                    <Typography>Ngày tạo</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography>Thao tác</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => (
                  <TableRow key={report.reportId} sx={styles.tableRow}>
                    <TableCell>
                      <Chip
                        label={report.reportType}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{getEmployeeName(report.employeeId)}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {report.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleGeneratePDF(report)}
                          title="Xuất PDF"
                        >
                          <PdfIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(report)}
                          title="Sửa"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedReport(report);
                            setOpenDeleteDialog(true);
                          }}
                          title="Xóa"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reports.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={styles.dialogTitle}>
          {selectedReport ? 'Chỉnh sửa báo cáo' : 'Tạo báo cáo mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={styles.formSection}>
              <Typography variant="h6" sx={styles.formSectionTitle}>
                Thông tin báo cáo
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={styles.formField}>
                    <InputLabel>Loại báo cáo</InputLabel>
                    <Select
                      name="reportType"
                      value={formData.reportType}
                      onChange={handleInputChange}
                      label="Loại báo cáo"
                    >
                      <MenuItem value="Tổng hợp">Báo cáo tổng hợp</MenuItem>
                      <MenuItem value="Tài chính">Báo cáo tài chính</MenuItem>
                      <MenuItem value="Cư dân">Báo cáo cư dân</MenuItem>
                      <MenuItem value="Công việc">Báo cáo công việc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={styles.formField}>
                    <InputLabel>Người tạo</InputLabel>
                    <Select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      label="Người tạo"
                      required
                    >
                      {employees.map((employee) => (
                        <MenuItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Phân tích và đề xuất"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    sx={styles.formField}
                    helperText="Nhập phân tích và đề xuất của bạn về tình hình chung cư"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isDataLoading}
            sx={styles.addButton}
          >
            {selectedReport ? 'Cập nhật' : 'Tạo báo cáo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa báo cáo này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportManagement;
