import axios from 'axios';

const api = axios.create({
    baseURL: 'https://gitsocial-backend.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let accessToken = null;
let refreshRequest = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const clearAccessToken = () => {
    accessToken = null;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use(
    (config) => {
        const isAuthRequest = config.url?.startsWith('/auth/');

        if (accessToken && !isAuthRequest) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const isAuthRequest = originalRequest?.url?.startsWith('/auth/');

        if (status !== 401 || originalRequest?._retry || isAuthRequest) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshRequest) {
                refreshRequest = api.post('/auth/refresh');
            }

            const response = await refreshRequest;
            const newAccessToken = response.data?.accessToken;

            if (!newAccessToken) {
                clearAccessToken();
                return Promise.reject(error);
            }

            setAccessToken(newAccessToken);
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            clearAccessToken();
            return Promise.reject(refreshError);
        } finally {
            refreshRequest = null;
        }
    }
);

export default api;
