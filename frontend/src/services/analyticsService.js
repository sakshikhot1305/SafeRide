import api from './api';

export const analyticsService = {
  // Admin analytics
  getAdminAnalytics: async () => {
    const response = await api.get('/api/analytics');
    return response.data;
  },
};

export default analyticsService;
