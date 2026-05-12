import api from './axiosInstance';

export const postService = {
    getFeed: async ({ page = 0, size = 10 } = {}) => {
        const response = await api.get('/posts/feed', {
            params: { page, size },
        });
        return response.data;
    },

    toggleLike: async (postId) => {
        const response = await api.post(`/posts/${postId}/likes`);
        return response.data;
    },

    getComments: async (postId, { page = 0, size = 20 } = {}) => {
        const response = await api.get(`/posts/${postId}/comments`, {
            params: { page, size },
        });
        return response.data;
    },

    addComment: async (postId, content) => {
        const response = await api.post(`/posts/${postId}/comments`, { content });
        return response.data;
    },
};
