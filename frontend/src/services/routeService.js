import api from './api';

export const routeService = {
  getAllRoutes: async () => {
    const response = await api.get('/api/routes');
    return response.data;
  },

  getRouteById: async (id) => {
    const response = await api.get(`/api/routes/${id}`);
    return response.data;
  },

  createRoute: async (routeData) => {
    const response = await api.post('/api/routes', routeData);
    return response.data;
  },

  updateRoute: async (id, routeData) => {
    const response = await api.put(`/api/routes/${id}`, routeData);
    return response.data;
  },

  deleteRoute: async (id) => {
    const response = await api.delete(`/api/routes/${id}`);
    return response.data;
  },
};

export default routeService;
