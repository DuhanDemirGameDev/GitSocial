import React, { useState } from 'react';
import { authService } from '../api/authService';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      // Backend'e mail atması için istek gönderiyoruz
      const responseMsg = await authService.forgotPassword({ email });
      setMessage(responseMsg || "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
      setEmail(''); // İşlem başarılıysa kutuyu temizle
    } catch (err) {
        console.error("API'den Gelen Hata Detayı: ", err); 
      // Backend'den fırlatılan hatayı veya genel hatayı göster
      setError(err.response?.data?.message || 'Bir hata oluştu. E-posta adresinizi kontrol edip tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      
      {/* SOL TARAF - Görsel ve Slogan (Sadece büyük ekranlarda görünür) */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="z-10 text-center px-12">
          <h1 className="text-6xl font-extrabold text-white mb-6 tracking-tight">
            Git<span className="text-blue-500">Social</span>
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed">
            Şifrenizi mi unuttunuz? Dert etmeyin. <br/>
            Geliştirici hesabınızı kurtarmak sadece birkaç saniye sürer.
          </p>
        </div>
      </div>

      {/* SAĞ TARAF - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900 lg:bg-gray-800/50">
        <div className="max-w-md w-full bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-700">
          
          <div className="text-center mb-8 lg:hidden">
            <h2 className="text-4xl font-extrabold text-white">
              Git<span className="text-blue-500">Social</span>
            </h2>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-2">Şifremi Unuttum</h3>
          <p className="text-gray-400 text-sm mb-8">E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.</p>

          {/* Başarı Mesajı */}
          {message && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-sm mb-6">
              {message}
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-Posta Adresi</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="dev@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || message} // Başarılı olunca butonu kilitle
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <a href="/login" className="font-bold text-blue-500 hover:text-blue-400 transition-colors">
              &larr; Giriş Sayfasına Dön
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ForgotPassword;