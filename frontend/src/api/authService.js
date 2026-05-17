import api, { clearAccessToken, getAccessToken, setAccessToken } from './axiosInstance';

// DEĞİŞİKLİK 1: Hafızada kullanıcı yoksa, tarayıcının kalıcı belleğine (localStorage) bak
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

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
            
            // DEĞİŞİKLİK 2: Giriş yapıldığında kullanıcıyı tarayıcıya kaydet (F5'te silinmesin)
            if (currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }

        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            clearAccessToken();
            currentUser = null;
            // DEĞİŞİKLİK 3: Çıkış yapıldığında kullanıcı bilgisini de temizle
            localStorage.removeItem('currentUser');
        }
    },

    getCurrentUser: () => currentUser,

    isAuthenticated: () => Boolean(getAccessToken()),

    refreshSession: async () => {
        const response = await api.post('/auth/refresh');

        if (response.data?.accessToken) {
            setAccessToken(response.data.accessToken);
            currentUser = response.data.user ?? currentUser;
            
            if (currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            return true;
        }

        clearAccessToken();
        currentUser = null;
        localStorage.removeItem('currentUser');
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