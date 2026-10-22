import api from './api';

export const trackingService = {
  // Driver sends real-time GPS location
  updateLocation: async ({ latitude, longitude, speed = 0 }) => {
    const response = await api.post('/api/tracking/location', {
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: Number(speed),
    });
    return response.data;
  },

  // Admin or parent retrieves latest bus location
  getBusLocation: async (busId) => {
    const response = await api.get(`/api/tracking/${busId}`);
    return response.data;
  },

  // Retrieve AI arrival prediction and route delay details
  getBusETA: async (busId, stopId = null) => {
    const url = stopId
      ? `/api/tracking/${busId}/eta?stopId=${stopId}`
      : `/api/tracking/${busId}/eta`;
    const response = await api.get(url);
    return response.data;
  },
};

export default trackingService;
