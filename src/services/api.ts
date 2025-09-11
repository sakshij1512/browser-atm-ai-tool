import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  //timeout: 30000
});

// Add request interceptor for error handling
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    throw new Error(message);
  }
);

export const testService = {
  // Configurations
  getConfigurations: () => api.get('/tests/configurations'),
  createConfiguration: (config: any) => api.post('/tests/configurations', config),
  updateConfiguration: (id: string, config: any) => api.put(`/tests/configurations/${id}`, config),
  deleteConfiguration: (id: string) => api.delete(`/tests/configurations/${id}`),

  // Test execution
  runTest: (configId: string) => api.post(`/tests/run/${configId}`),
  
  // Results
  getResults: (configId?: string, page = 1, limit = 10) => 
    api.get(`/tests/results/${configId || 'all'}?page=${page}&limit=${limit}`),
  getResultDetail: (executionId: string) => api.get(`/tests/results/detail/${executionId}`),

  // Reports
  getDashboardData: () => api.get('/reports/dashboard'),
  getTrends: (days = 30) => api.get(`/reports/trends?days=${days}`),
  exportResults: (format: string, filters?: any) => 
    api.get(`/reports/export/${format}`, { params: filters }),

  // Configuration
  getSystemConfig: () => api.get('/config/system')
};

export default api;