
import api from './axiosInstance';

export const authService = {
    // 1. Kullanıcı Kayıt Olma İsteği
    register: async (userData) => {
        try {
            // Backend'deki Postman'de denediğimiz uca post atıyoruz
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error("Kayıt işlemi başarısız:", error);
            throw error;
        }
    },

    // 2. Kullanıcı Giriş Yapma İsteği
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            
            // Eğer giriş başarılıysa ve backend bize token döndüyse:
            if (response.data && response.data.accessToken) {
                // Token'ı tarayıcının yerel deposuna (localStorage) kaydet
                localStorage.setItem('accessToken', response.data.accessToken);
                // Kullanıcı bilgilerini de kaydedebiliriz
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            console.error("Giriş işlemi başarısız:", error);
            throw error;
        }
    },

    // 3. Çıkış Yapma İsteği (Token'ı temizle)
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // İleride buraya backend'e çıkış yapıldığını bildiren bir istek de eklenebilir
    }
};