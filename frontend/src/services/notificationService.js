import api from './api';

export const notificationService = {
  // Parent retrieves notifications
  getParentNotifications: async () => {
    const response = await api.get('/api/notifications');
    return response.data;
  },

  // Parent marks a notification as read
  markNotificationRead: async (id) => {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  },
};

export default notificationService;
