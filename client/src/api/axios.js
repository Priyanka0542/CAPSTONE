import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single active refresh promise to share across all concurrent 401s
let activeRefreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no config or request was already retried, do not retry
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do NOT attempt token refresh for authentication/credentials endpoints
    const url = originalRequest.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password');

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Handle token expiration
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED'
    ) {
      originalRequest._retry = true;

      // Ensure ONLY ONE refresh operation is active at a time
      if (!activeRefreshPromise) {
        activeRefreshPromise = axios
          .post('/api/auth/refresh', {}, { withCredentials: true })
          .then(({ data }) => {
            if (data?.accessToken) {
              localStorage.setItem('accessToken', data.accessToken);
              return data.accessToken;
            }
            throw new Error('No access token returned from refresh');
          })
          .catch((refreshError) => {
            localStorage.removeItem('accessToken');
            return Promise.reject(refreshError);
          })
          .finally(() => {
            activeRefreshPromise = null;
          });
      }

      // All concurrent requests await the exact same single refresh promise
      try {
        const newAccessToken = await activeRefreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

