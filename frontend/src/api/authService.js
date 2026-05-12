import api, { clearAccessToken, getAccessToken, setAccessToken } from './axiosInstance';

let currentUser = null;

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);

        if (response.data?.accessToken) {
            setAccessToken(response.data.accessToken);
            currentUser = response.data.user ?? null;
        }

        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            clearAccessToken();
            currentUser = null;
        }
    },

    getCurrentUser: () => currentUser,

    isAuthenticated: () => Boolean(getAccessToken()),

    refreshSession: async () => {
        const response = await api.post('/auth/refresh');

        if (response.data?.accessToken) {
            setAccessToken(response.data.accessToken);
            return true;
        }

        clearAccessToken();
        currentUser = null;
        return false;
    },

    forgotPassword: async (data) => {
        const response = await api.post('/auth/forgot-password', data);
        return response.data;
    },

    resetPassword: async (data) => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },
};
