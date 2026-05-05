import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Backend'e kayıt isteğini atıyoruz
      await authService.register({ 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      alert("Kayıt başarıyla tamamlandı! Lütfen giriş yapın.");
      navigate('/login'); // Başarılı kayıttan sonra Login'e yönlendir
      
    } catch (err) {
      setError('Kayıt işlemi başarısız. Bu e-posta zaten kullanılıyor olabilir.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      
      {/* SOL TARAF - Görsel ve Slogan */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="z-10 text-center px-12">
          <h1 className="text-6xl font-extrabold text-white mb-6 tracking-tight">
            Git<span className="text-blue-500">Social</span>
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed">
            Yazılımcı ekosistemine katıl. <br/>
            Topluluklar kur, iş ilanlarını keşfet, ağını genişlet.
          </p>
        </div>
      </div>

      {/* SAĞ TARAF - Kayıt Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900 lg:bg-gray-800/50">
        <div className="max-w-md w-full bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-700">
          
          <div className="text-center mb-8 lg:hidden">
            <h2 className="text-4xl font-extrabold text-white">
              Git<span className="text-blue-500">Social</span>
            </h2>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-2">Aramıza Katıl</h3>
          <p className="text-gray-400 text-sm mb-8">Geliştirici hesabını ücretsiz oluştur.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ad ve Soyad (Yan yana) */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Ad</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Zeynep"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Soyad</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Gerçekdoğan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-Posta Adresi</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="dev@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
              <input
                type="password"
                required
                minLength="8"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="En az 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">En az 1 büyük harf ve 1 rakam içermelidir.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-400">Zaten bir hesabın var mı? </span>
            <a href="/login" className="font-bold text-blue-500 hover:text-blue-400 transition-colors">
              Giriş Yap
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Register;