import axios from 'axios';

const API_URL = '/api';

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
    getStats: (id) => api.get(`/users/${id}/stats`)
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
    complete: (id, data) => api.post(`/jobs/${id}/complete`, data)
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
    getTrainingSuggestions: () => api.get('/analytics/training-suggestions'),
    getOverview: () => api.get('/analytics/overview'),
    getWeeklyTrends: () => api.get('/analytics/weekly-trends')
};

export default api;
