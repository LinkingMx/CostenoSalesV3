/**
 * API Endpoint Constants
 * Base URL and endpoint definitions for the CostenoSales API
 */

export const API_CONFIG = {
  BASE_URL: 'http://192.168.100.20/api/',
  TIMEOUT: 30000, // 30 seconds
} as const;

export const API_ENDPOINTS = {
  HOURS_CHART: 'get_hours_chart',
  MAIN_DASHBOARD: 'main_dashboard_data',
} as const;

export const getEndpointUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return `${API_CONFIG.BASE_URL}${API_ENDPOINTS[endpoint]}`;
};