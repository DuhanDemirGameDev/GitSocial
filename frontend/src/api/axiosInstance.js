import axios from 'axios';

// 1. Temel Axios Örneğini (Instance) Oluşturuyoruz
const api = axios.create({
    baseURL: 'http://localhost:8080', // Backend sunucumuzun adresi
    headers: {
        'Content-Type': 'application/json',
    },
    // SRS belgesindeki [GitS_Sec_2] kuralı gereği HttpOnly cookie (Refresh Token) 
    // kullanacağımız için kimlik bilgilerini isteklerle taşımaya izin veriyoruz.
    withCredentials: true 
});

// 2. İSTEK (REQUEST) GÜMRÜĞÜ
// React'ten backend'e giden her istek, yola çıkmadan hemen ÖNCE buraya uğrar.
api.interceptors.request.use(
    (config) => {
        // İleride giriş yaptığımızda Access Token'ı localStorage'a kaydedeceğiz. Şimdi oradan okuyoruz.
        const token = localStorage.getItem('accessToken');
        
        // Eğer cebimizde (localStorage) token varsa, bunu giden isteğin "Authorization" başlığına ekle
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. YANIT (RESPONSE) GÜMRÜĞÜ
// Backend'den gelen her cevap, React bileşenlerine ulaşmadan ÖNCE buraya uğrar.
api.interceptors.response.use(
    (response) => {
        // Cevap başarılıysa (200 OK, 201 Created vb.) hiç dokunmadan geçir
        return response;
    },
    (error) => {
        // Eğer backend bize 401 Unauthorized (Yetkisiz) dönerse (Token süresi bitmiş veya yanlışsa)
        if (error.response && error.response.status === 401) {
            console.error("Oturum süresi doldu veya yetkisiz erişim!");
            
            // Şimdilik token'ı temizleyelim. İlerleyen aşamalarda buraya 
            // "Kullanıcıyı Login sayfasına yönlendir" mantığını ekleyeceğiz.
            localStorage.removeItem('accessToken');
            
            // Not: Refresh token mantığını kurduğumuzda, yeni access token alma 
            // kodlarını da tam olarak bu bloğun içine yazacağız.
        }
        return Promise.reject(error);
    }
);

export default api;