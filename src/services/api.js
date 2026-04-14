import axios from 'axios';

const API = axios.create({ baseURL: 'https://localgems-backend-5.onrender.com', withCredentials: true });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          original.headers.Authorization = 'Bearer ' + data.data.accessToken;
          return API(original);
        } catch { localStorage.clear(); window.location.href = '/login'; }
      }
    }
    return Promise.reject(error);
  }
);

export default API;

export const authAPI = {
  register: (d) => API.post('/auth/register', d),
  login: (d) => API.post('/auth/login', d),
  logout: () => API.post('/auth/logout'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post('/auth/reset-password/' + token, { password }),
  getMe: () => API.get('/auth/me'),
};
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (d) => API.put('/users/update', d),
  changePassword: (d) => API.put('/users/change-password', d),
};
export const talentAPI = {
  search: (params) => API.get('/talent/search', { params }),
  getById: (id) => API.get('/talent/' + id),
  getMyProfile: () => API.get('/talent/me'),
  upsertProfile: (d) => API.post('/talent/profile', d),
};
export const bookingAPI = {
  create: (d) => API.post('/bookings', d),
  getUserBookings: () => API.get('/bookings/user'),
  getById: (id) => API.get('/bookings/' + id),
  updateStatus: (id, status) => API.put('/bookings/' + id + '/status', { status }),
};
export const reviewAPI = {
  create: (d) => API.post('/reviews', d),
  getTalentReviews: (talentId) => API.get('/reviews/' + talentId),
};
export const eventAPI = {
  getAll: (params) => API.get('/events', { params }),
  getMy: () => API.get('/events/my'),
  create: (d) => API.post('/events', d),
  apply: (id, d) => API.post('/events/' + id + '/apply', d),
};
export const messageAPI = {
  getConversations: () => API.get('/messages'),
  getConversation: (userId) => API.get('/messages/' + userId),
  send: (d) => API.post('/messages', d),
};
export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUser: (id) => API.put('/admin/users/' + id + '/toggle'),
  getPendingTalents: () => API.get('/admin/talent/pending'),
  updateTalentStatus: (id, status) => API.put('/admin/talent/' + id + '/status', { status }),
  toggleFeature: (id) => API.put('/admin/talent/' + id + '/feature'),
};
export const paymentAPI = {
  createIntent: (bookingId) => API.post('/payments/create-intent', { bookingId }),
  getStatus: (bookingId) => API.get('/payments/status/' + bookingId),
};
