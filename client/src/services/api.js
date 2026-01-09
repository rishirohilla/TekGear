import axios from 'axios';

// Use environment variable in production, fallback to /api for local dev with Vite proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    signup: (data) => api.post('/auth/signup', data),
    getMe: () => api.get('/auth/me')
};

// Users APIs
export const usersAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    getStats: (id) => api.get(`/users/${id}/stats`),
    updateSettings: (id, data) => api.put(`/users/${id}/settings`, data),
    resetWeekly: (id) => api.post(`/users/${id}/reset-weekly`)
};

// Jobs APIs
export const jobsAPI = {
    getAll: (params = {}) => api.get('/jobs', { params }),
    getMyJobs: () => api.get('/jobs/my-jobs'),
    getById: (id) => api.get(`/jobs/${id}`),
    create: (data) => api.post('/jobs', data),
    update: (id, data) => api.put(`/jobs/${id}`, data),
    delete: (id) => api.delete(`/jobs/${id}`),
    start: (id) => api.post(`/jobs/${id}/start`),
    complete: (id, data) => api.post(`/jobs/${id}/complete`, data),
    // Job Request/Approval Workflow
    getPendingRequests: () => api.get('/jobs/pending-requests'),
    request: (id) => api.post(`/jobs/${id}/request`),
    approve: (id) => api.post(`/jobs/${id}/approve`),
    reject: (id, data) => api.post(`/jobs/${id}/reject`, data),
    assign: (id, techId) => api.post(`/jobs/${id}/assign`, { techId }),
    reassign: (id, data) => api.post(`/jobs/${id}/reassign`, data)
};

// Incentive Rules APIs
export const incentiveRulesAPI = {
    getAll: () => api.get('/incentive-rules'),
    getActive: () => api.get('/incentive-rules/active'),
    create: (data) => api.post('/incentive-rules', data),
    update: (id, data) => api.put(`/incentive-rules/${id}`, data),
    delete: (id) => api.delete(`/incentive-rules/${id}`)
};

// Analytics APIs
export const analyticsAPI = {
    getLeaderboard: () => api.get('/analytics/leaderboard'),
    getBottlenecks: () => api.get('/analytics/bottlenecks'),
    getOverview: () => api.get('/analytics/overview'),
    getWeeklyTrends: () => api.get('/analytics/weekly-trends')
};

// Shop APIs
export const shopAPI = {
    getMyShop: () => api.get('/shop/my-shop'),
    getPendingTechs: () => api.get('/shop/pending-techs'),
    approveTech: (id) => api.post(`/shop/approve-tech/${id}`),
    rejectTech: (id, data) => api.post(`/shop/reject-tech/${id}`, data),
    removeTech: (id) => api.post(`/shop/remove-tech/${id}`),
    regenerateCode: () => api.put('/shop/regenerate-code'),
    updateShop: (data) => api.put('/shop/update', data),
    validateCode: (code) => api.get(`/shop/validate-code/${code}`)
};

export default api;
