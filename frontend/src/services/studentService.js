import api from './api';

export const studentService = {
  getAllParents: async () => {
    const response = await api.get('/api/students/parents');
    return response.data;
  },

  getAllStudents: async () => {
    const response = await api.get('/api/students');
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/api/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await api.post('/api/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await api.put(`/api/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/api/students/${id}`);
    return response.data;
  },

  getMyChildren: async () => {
    const response = await api.get('/api/students/my-children');
    return response.data;
  },
};

export default studentService;
