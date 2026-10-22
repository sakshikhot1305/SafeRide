import api from './api';

export const attendanceService = {
  // Driver scans student QR code (or inputs student ID manually)
  scanStudentQR: async ({ studentId, action }) => {
    const response = await api.post('/api/attendance/scan', { studentId, action });
    return response.data;
  },

  // Admin gets all attendance records
  getAttendance: async () => {
    const response = await api.get('/api/attendance');
    return response.data;
  },

  // Driver gets today's attendance for their bus
  getMyBusAttendance: async () => {
    const response = await api.get('/api/attendance/my-bus');
    return response.data;
  },

  // Parent gets attendance history for their children
  getMyChildrenAttendance: async () => {
    const response = await api.get('/api/attendance/my-children');
    return response.data;
  },
};

export default attendanceService;
