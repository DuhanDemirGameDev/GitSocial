import api from './axiosInstance';

export const communityService = {
    getAll: async () => {
        const response = await api.get('/communities');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/communities/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/communities', data);
        return response.data;
    },

    join: async (id) => {
        const response = await api.post(`/communities/${id}/join`);
        return response.data;
    },

    leave: async (id) => {
        const response = await api.post(`/communities/${id}/leave`);
        return response.data;
    },
};
