import axios, {
  type AxiosInstance,
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

/**
 * Standard API Response interface to match the Java backend ApiResponse.java
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/cinema/api', // Update with your actual server URL & context path
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for sending/receiving cookies (auth_token)
});

/**
 * Request Interceptor
 * Useful if you decide to use Bearer tokens in headers later,
 * though your current backend uses HttpOnly cookies.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If you ever switch from cookies to localStorage:
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor
 * Centralized error handling for 401 (Unauthorized) and 403 (Forbidden)
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error('Unauthorized: Redirecting to login...');
          // Optional: window.location.href = '/login';
          break;
        case 403:
          console.error(
            'Forbidden: You do not have permission (Admin required)',
          );
          break;
        case 500:
          console.error(
            'Server Error:',
            data?.message || 'Internal Server Error',
          );
          break;
      }
    } else if (error.request) {
      console.error('Network Error: No response received from server');
    }

    return Promise.reject(error);
  },
);

export default api;
