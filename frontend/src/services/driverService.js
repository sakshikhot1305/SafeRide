import api from './api';

export const driverService = {
  getAllDrivers: async () => {
    const response = await api.get('/api/drivers');
    return response.data;
  },

  getDriverById: async (id) => {
    const response = await api.get(`/api/drivers/${id}`);
    return response.data;
  },

  createDriver: async (driverData) => {
    const response = await api.post('/api/drivers', driverData);
    return response.data;
  },

  updateDriver: async (id, driverData) => {
    const response = await api.put(`/api/drivers/${id}`, driverData);
    return response.data;
  },

  deleteDriver: async (id) => {
    const response = await api.delete(`/api/drivers/${id}`);
    return response.data;
  },

  getMyDriverProfile: async () => {
    const response = await api.get('/api/drivers/me');
    return response.data;
  },

  getMyBusStudents: async () => {
    const response = await api.get('/api/drivers/my-bus/students');
    return response.data;
  },
};

export default driverService;
