import axios from 'axios';
import { deleteCookie, getCookie, hasCookie } from 'cookies-next';
import { showError } from './toastUtils';
import { JSONParse } from './utils';


const Baseurl = process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:5000/api/v1'

// Create an Axios instance factory function
const axiosInstance = () => {
  // Retrieve the token from cookies
  const token = hasCookie('agritech_token') ? JSONParse(getCookie('agritech_token')) : null

  // Create an Axios instance with default headers
  const instance = axios.create({
    baseURL: Baseurl, // Your backend API base URL
    headers: {
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // Only set Authorization if token exists
    },
  });

  // Request interceptor to handle multipart/form-data requests
  instance.interceptors.request.use(
    (config) => {
      if (config.data instanceof FormData) {
        // Remove 'Content-Type' to let the browser set the correct boundary
        delete config.headers['Content-Type'];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for centralized error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const statusCode = error?.response?.status;
        const errorData = error?.response?.data?.error;

        if (statusCode === 400 && errorData.errors) {
          showError('Validation failed!');
        } else if (statusCode === 401) {
          showError(errorData?.message || 'Unauthorized! Please login again.');
          // deleteCookie('agritech_token');
          // deleteCookie('agritech_user');
          // setTimeout(()=>{
          //   window.location.href = '/login';
          // },3000)
        } else if (statusCode === 403) {
          showError(errorData?.message || 'Access Denied!');
        } else if (statusCode === 404) {
          showError(errorData?.message || 'Resource not found!');
        } else if (statusCode === 409) {
          showError(errorData?.message || 'Resource already exists!');
        } else if (statusCode === 500) {
          showError(errorData?.message || 'Internal server error. Please try again later.');
        } else {
          showError(errorData?.message || 'Something went wrong!');
        }
      } else if (error.request) {
        showError('No response from server. Please check your network connection.');
      } else {
        showError(error.message || 'Something went wrong!');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default axiosInstance;