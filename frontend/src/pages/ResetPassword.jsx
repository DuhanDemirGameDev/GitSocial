import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../api/authService';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  // URL'deki "?token=xyz" kısmını yakalamak için kullanıyoruz
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (!token) {
      setError('Geçersiz veya eksik sıfırlama bağlantısı.');
      return;
    }

    setIsLoading(true);

    try {
      // Backend'deki uç noktaya token ve yeni şifreyi yolluyoruz
      const responseMsg = await authService.resetPassword({ 
        token: token, 
        newPassword: newPassword 
      });
      
      setMessage(responseMsg || 'Şifreniz başarıyla güncellendi!');
      
      // 3 saniye sonra kullanıcıyı giriş ekranına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre sıfırlama işlemi başarısız oldu. Linkin süresi dolmuş olabilir.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-700 relative overflow-hidden">
        
        {/* Dekoratif Işıklar */}
        <div className="absolute top-[-20%] left-[-20%] w-48 h-48 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-48 h-48 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-white mb-2">Yeni Şifre Belirle</h2>
            <p className="text-gray-400 text-sm">Hesabınızı güvenceye almak için güçlü bir şifre oluşturun.</p>
          </div>

          {message && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-sm mb-6 text-center">
              {message} <br/> Giriş sayfasına yönlendiriliyorsunuz...
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Yeni Şifre</label>
                <input
                  type="password"
                  required
                  minLength="8"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="En az 8 karakter, 1 büyük harf, 1 rakam"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {isLoading ? 'Güncelleniyor...' : 'Şifremi Kaydet'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;