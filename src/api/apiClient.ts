import axios from 'axios';

// Create a new axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Use an "interceptor" to automatically add the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This interceptor checks for errors in every incoming response
apiClient.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  (error) => {
    // Check if the error is a 401 Unauthorized (which means our token is bad)
    if (error.response && error.response.status === 401) {
      console.log('Token expired or invalid. Logging out.');
      // Remove the expired token from storage
      localStorage.removeItem('accessToken');
      // Redirect the user to the login page
      window.location.href = '/login';
    }
    // For all other errors, just return the error
    return Promise.reject(error);
  }
);

export default apiClient;