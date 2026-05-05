import React, { useState } from 'react';
import { authService } from '../api/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      alert("Giriş Başarılı! Token LocalStorage'a kaydedildi.");
      // window.location.href = '/discover'; // İleride yönlendirmeyi açacağız
    } catch (err) {
      setError('Hatalı e-posta veya şifre girdiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      
      {/* SOL TARAF - Görsel ve Slogan (Sadece büyük ekranlarda görünür) */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 items-center justify-center relative overflow-hidden">
        {/* Dekoratif Arka Plan (Mavi Işık Efekti) */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="z-10 text-center px-12">
          <h1 className="text-6xl font-extrabold text-white mb-6 tracking-tight">
            Git<span className="text-blue-500">Social</span>
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed">
            Gürültüden uzak, sadece yazılımcılar için tasarlandı. <br/>
            Kodla, paylaş, teknoloji dünyasıyla bağlantı kur.
          </p>
        </div>
      </div>

      {/* SAĞ TARAF - Giriş Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900 lg:bg-gray-800/50">
        <div className="max-w-md w-full bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-700">
          
          <div className="text-center mb-8 lg:hidden">
            <h2 className="text-4xl font-extrabold text-white">
              Git<span className="text-blue-500">Social</span>
            </h2>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-2">Tekrar Hoş Geldin!</h3>
          <p className="text-gray-400 text-sm mb-8">Devam etmek için hesabına giriş yap.</p>

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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Şifre</label>
                <a href="#" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">Şifremi Unuttum</a>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-400">Henüz aramızda değil misin? </span>
            <a href="/register" className="font-bold text-blue-500 hover:text-blue-400 transition-colors">
              Hesap Oluştur
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;