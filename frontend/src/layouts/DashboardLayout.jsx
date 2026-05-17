import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { searchService } from '../api/searchService'; // Arama servisini ekledik
import { Home, Briefcase, Users, UserCircle, LogOut, Search, MessageSquare, User } from 'lucide-react';

function DashboardLayout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Arama Kutusu İçin Gerekli State'ler
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [], communities: [] });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef(null); // Dışarı tıklanınca kapatmak için ref

  const navItems = [
    { name: 'Akış', path: '/', icon: Home, color: 'text-blue-400 group-hover:text-blue-300 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' },
    { name: 'İş İlanları', path: '/jobs', icon: Briefcase, color: 'text-purple-400 group-hover:text-purple-300 group-hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' },
    { name: 'Topluluklar', path: '/communities', icon: Users, color: 'text-emerald-400 group-hover:text-emerald-300 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' },
    { name: 'Profilim', path: '/profile', icon: UserCircle, color: 'text-amber-400 group-hover:text-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' },
  ];

  // Arama İşlemini Tetikleyen Effect (Debounce mantığıyla sunucuyu yormuyoruz)
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults({ users: [], posts: [], communities: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchService.globalSearch(query);
        setResults(data);
        setShowResults(true);
      } catch (err) {
        console.error("Arama esnasında hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // Kullanıcı yazmayı bıraktıktan 300ms sonra backend'e gider

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Kullanıcı arama kutusunun dışına tıkladığında arama panelini kapatır
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      setIsLoggingOut(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      
      {/* 1. ÜST BAR */}
      <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 flex items-center justify-between px-6 sticky top-0 z-50">
        
        {/* LOGO VE SİTE İSMİ GRUBU */}
        <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-gray-800 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <img 
              src="/logo.png" 
              alt="GS" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="text-blue-500 font-black text-sm tracking-tighter">GS</span>';
              }}
            />
          </div>
          <div className="text-2xl font-black tracking-tighter">
            Git<span className="text-blue-500">Social</span>
          </div>
        </div>
        
        {/* BAĞLANAN VE GÜÇLENDİRİLEN ARAMA ÇUBUĞU ALANI */}
        <div ref={searchRef} className="flex-1 max-w-md px-8 hidden md:block relative">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length > 0 && setShowResults(true)}
              className="block w-full pl-10 pr-4 py-1.5 border border-gray-800 rounded-xl bg-gray-800/40 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/80 transition-all text-sm"
              placeholder="Geliştirici, topluluk veya post ara..."
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
            
            {/* Küçük yükleniyor animasyonu */}
            {loading && (
              <span className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2"></span>
            )}
          </div>

          {/* DİNAMİK ARAMA SONUÇLARI DROPDOWN PANELİ */}
          {showResults && (query.trim().length > 0) && (
            <div className="absolute top-full left-8 right-8 mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-700/70 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto p-2 space-y-3 custom-scrollbar">
              
              {/* KULLANICILAR KATEGORİSİ */}
              {results.users.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Kişiler & Şirketler
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.users.map((u) => (
                      <div 
                        key={u.id} 
                        onClick={() => { setShowResults(false); navigate(`/profile/${u.id}`); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-700/50 cursor-pointer transition-all"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 overflow-hidden">
                          {u.profilePictureUrl ? <img src={u.profilePictureUrl} className="w-full h-full object-cover"/> : `${u.firstName[0]}${u.lastName[0]}`}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-200 truncate">{u.firstName} {u.lastName}</span>
                          {u.bio && <span className="block text-xs text-gray-400 truncate">{u.bio}</span>}
                        </div>
                        {u.accountType === 'COMPANY' && (
                          <span className="ml-auto text-[10px] font-extrabold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20">ŞİRKET</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TOPLULUKLAR KATEGORİSİ */}
              {results.communities.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Topluluklar
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.communities.map((c) => (
                      <div 
                        key={c.id}
                        onClick={() => { setShowResults(false); navigate(`/communities/${c.id}`); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-700/50 cursor-pointer transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                          👥
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-200 truncate">{c.name}</span>
                          {c.description && <span className="block text-xs text-gray-400 truncate">{c.description}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* POSTLAR KATEGORİSİ */}
              {results.posts.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Gönderiler
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.posts.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => { setShowResults(false); navigate(`/post/${p.id}`); }}
                        className="px-3 py-2 rounded-xl hover:bg-gray-700/50 cursor-pointer transition-all block text-left"
                      >
                        <span className="block text-xs font-medium text-blue-400 truncate">@{p.author.firstName}</span>
                        <p className="text-sm text-gray-300 truncate mt-0.5">{p.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HİÇBİR SONUÇ BULUNAMADIYSA */}
              {results.users.length === 0 && results.posts.length === 0 && results.communities.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  Uyuşan bir sonuç bulunamadı 🔍
                </div>
              )}

            </div>
          )}
        </div>

        {/* Sağ Üst Denge Alanı */}
        <div className="w-10 h-10 hidden md:block"></div>
      </header>

      {/* 2. ANA İÇERİK ALANI */}
      <main className="flex-1 overflow-y-auto pb-32 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* 3. ALT YÜZER MENÜ (Floating Dock) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 p-2 rounded-2xl shadow-2xl">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="group relative flex items-center justify-center w-14 h-14 rounded-xl hover:bg-gray-700/50 transition-all active:scale-90"
            >
              <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-gray-800 text-gray-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700 shadow-xl transition-all duration-200 whitespace-nowrap">
                {item.name}
              </span>
              <item.icon 
                strokeWidth={2.5} 
                className={`w-6 h-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 ${item.color}`} 
              />
            </Link>
          ))}

          <div className="w-px h-8 bg-gray-700/80 mx-1 rounded-full"></div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group relative flex items-center justify-center w-14 h-14 rounded-xl hover:bg-red-500/10 transition-all active:scale-90 disabled:opacity-50"
          >
             <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-gray-800 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700 shadow-xl transition-all duration-200">
                Çıkış
              </span>
            <LogOut 
                strokeWidth={2.5}
                className="w-6 h-6 text-red-500 group-hover:text-red-400 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
            />
          </button>
        </div>
      </nav>

    </div>
  );
}

export default DashboardLayout;