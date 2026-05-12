import api from './axiosInstance';

export const postService = {
    createPost: async ({ content, media, mediaUrl, communityId } = {}) => {
        const formData = new FormData();

        if (content?.trim()) {
            formData.append('content', content.trim());
        }

        if (media) {
            formData.append('media', media);
        }

        if (mediaUrl?.trim()) {
            formData.append('mediaUrl', mediaUrl.trim());
        }

        if (communityId) {
            formData.append('communityId', communityId);
        }

        const response = await api.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getFeed: async ({ page = 0, size = 10 } = {}) => {
        const response = await api.get('/posts/feed', {
            params: { page, size },
        });
        return response.data;
    },

    getCommunityPosts: async (communityId, { page = 0, size = 10 } = {}) => {
        const response = await api.get(`/communities/${communityId}/posts`, {
            params: { page, size },
        });
        return response.data;
    },

    updatePost: async (postId, content) => {
        const response = await api.put(`/posts/${postId}`, { content });
        return response.data;
    },

    deletePost: async (postId) => {
        await api.delete(`/posts/${postId}`);
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

    toggleCommentLike: async (postId, commentId) => {
        const response = await api.post(`/posts/${postId}/comments/${commentId}/likes`);
        return response.data;
    },

    deleteComment: async (postId, commentId) => {
        await api.delete(`/posts/${postId}/comments/${commentId}`);
    },
};
