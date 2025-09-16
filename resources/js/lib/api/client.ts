/**
 * API Client Configuration
 * Axios instance with hardcoded authentication token
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from './endpoints';
import { ApiError } from './types';

// Hardcoded authentication token as per requirements
const AUTH_TOKEN = '342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
    },
});

// Request interceptor for logging in development
apiClient.interceptors.request.use(
    (config) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('API Request:', {
                url: config.url,
                method: config.method,
                data: config.data,
            });
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('API Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }
        return response;
    },
    (error: AxiosError) => {
        const apiError: ApiError = {
            message: error.message || 'An error occurred',
            status: error.response?.status,
            code: error.code,
        };

        if (error.response?.data) {
            const errorData = error.response.data as any;
            if (errorData.message) {
                apiError.message = errorData.message;
            } else if (errorData.error) {
                apiError.message = errorData.error;
            }
        }

        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', apiError);
        }

        return Promise.reject(apiError);
    },
);

export default apiClient;

// Export typed methods for common operations
export const apiGet = <T = any>(url: string, config?: any) => apiClient.get<T>(url, config);

export const apiPost = <T = any>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config);

export const apiPut = <T = any>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config);

export const apiDelete = <T = any>(url: string, config?: any) => apiClient.delete<T>(url, config);
