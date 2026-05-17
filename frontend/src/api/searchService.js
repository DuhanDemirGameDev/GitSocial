import axios from 'axios';

// Eğer projedeki axios instance yapın farklıysa ona göre güncelleyebilirsin
const API_URL = 'http://localhost:8080';

export const searchService = {
  globalSearch: async (query) => {
    // Session token'ı alıp Header'a ekliyoruz (Yetkilendirme için)
    const token = localStorage.getItem('token'); 
    
    const response = await axios.get(`${API_URL}/search`, {
      params: { query },
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    return response.data;
  }
};