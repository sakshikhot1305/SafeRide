import api from './api';

export const busService = {
  getAllBuses: async () => {
    const response = await api.get('/api/buses');
    return response.data;
  },

  getBusById: async (id) => {
    const response = await api.get(`/api/buses/${id}`);
    return response.data;
  },

  createBus: async (busData) => {
    const response = await api.post('/api/buses', busData);
    return response.data;
  },

  updateBus: async (id, busData) => {
    const response = await api.put(`/api/buses/${id}`, busData);
    return response.data;
  },

  deleteBus: async (id) => {
    const response = await api.delete(`/api/buses/${id}`);
    return response.data;
  },
};

export default busService;
