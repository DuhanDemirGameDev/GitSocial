import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { authService } from '../api/authService';
import PostCard from "../components/PostCard";
import { Edit3, Camera, Check, X, Users, MapPin, Calendar, Briefcase } from 'lucide-react';

export default function Profile() {
  // Eğer URL'de bir ID varsa o kullanıcının profili, yoksa kendi profilimiz
  const { id } = useParams(); 
  const currentUser = authService.getCurrentUser();
  const profileId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === profileId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Biyografi Düzenleme Stateleri
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  // Profil Fotoğrafı Yükleme Stateleri
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  async function fetchProfile() {
    setLoading(true);
    setError('');
    try {
      // Backend'deki endpoint'in tam adını kendi projene göre güncellemen gerekebilir
      // Örn: /users/{id}/profile
      const response = await api.get(`/users/${profileId}/profile`);
      setProfile(response.data);
      setBioInput(response.data.bio || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Profil yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  // Takip Et / Takipten Çık Fonksiyonu
  async function handleToggleFollow() {
    try {
      await api.post(`/users/${profileId}/toggle-follow`);
      // İşlem başarılıysa profili tekrar çekerek takipçi sayısını güncelliyoruz
      fetchProfile();
    } catch (err) {
      alert("Takip işlemi başarısız oldu.");
    }
  }

  // Biyografi Kaydetme Fonksiyonu
  async function handleSaveBio() {
    setSavingBio(true);
    try {
      await api.put(`/users/${profileId}/bio`, { bio: bioInput });
      setProfile(prev => ({ ...prev, bio: bioInput }));
      setIsEditingBio(false);
    } catch (err) {
      alert("Biyografi güncellenemedi.");
    } finally {
      setSavingBio(false);
    }
  }

  // Profil Fotoğrafı Yükleme Fonksiyonu (Cloudinary)
  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const response = await api.post(`/users/${profileId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Başarılı olursa yeni resmi arayüze yansıt
      setProfile(prev => ({ ...prev, profilePictureUrl: response.data.profilePictureUrl }));
    } catch (err) {
      alert("Fotoğraf yüklenemedi. Boyutu çok büyük olabilir.");
    } finally {
      setUploadingImage(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 bg-gray-800/40 rounded-2xl border border-gray-700">
        <p className="text-red-400 font-bold">{error || 'Profil bulunamadı.'}</p>
      </div>
    );
  }

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* ÜST KISIM: KAPAK, AVATAR VE TEMEL BİLGİLER */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Kapak Fotoğrafı (Gradient) */}
        <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Profil Bilgileri Alanı */}
        <div className="px-6 pb-6 relative">
          
          <div className="flex justify-between items-start">
            {/* Avatar Alanı */}
            <div className="relative -mt-16 mb-4 group inline-block">
              <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden shadow-xl relative z-10">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-gray-400">{initials}</span>
                )}

                {/* Eğer kendi profilimizse, üzerine gelince yükleme ikonu çıksın */}
                {isOwnProfile && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300"
                  >
                    {uploadingImage ? (
                      <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            {/* Aksiyon Butonları (Profili Düzenle veya Takip Et) */}
            <div className="pt-4">
              {isOwnProfile ? (
                <button 
                  onClick={() => setIsEditingBio(true)}
                  className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 text-sm font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Profili Düzenle
                </button>
              ) : (
                <button 
                  onClick={handleToggleFollow}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${
                    profile.isFollowing 
                      ? 'bg-gray-800 hover:bg-red-500/20 hover:text-red-400 border border-gray-600 hover:border-red-500/50 text-gray-200' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {profile.isFollowing ? 'Takipten Çık' : 'Takip Et'}
                </button>
              )}
            </div>
          </div>

          {/* İsim ve Şirket Etiketi */}
          <div className="mb-4">
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              {profile.firstName} {profile.lastName}
              {/* Eğer backend'den company kontrolü geliyorsa burayı açabilirsin
              {profile.accountType === 'COMPANY' && (
                <span className="text-[10px] font-extrabold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20">ŞİRKET</span>
              )}
              */}
            </h1>
            <p className="text-gray-400 text-sm">{profile.email}</p>
          </div>

          {/* Biyografi Alanı */}
          <div className="mb-6">
            {isEditingBio ? (
              <div className="animate-in fade-in space-y-3 bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  maxLength={160}
                  placeholder="Kendinden bahset..."
                  className="w-full bg-transparent text-gray-200 text-sm outline-none resize-none min-h-[60px]"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsEditingBio(false)} className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleSaveBio} disabled={savingBio} className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-[15px] leading-relaxed max-w-2xl">
                {profile.bio || (isOwnProfile ? <span className="text-gray-500 italic">Henüz bir biyografi eklemediniz. Eklemek için tıklayın.</span> : '')}
              </p>
            )}
          </div>

          {/* İstatistikler ve Bilgiler */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 border-t border-gray-700/50 pt-5">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-200 transition-colors">
                <strong className="text-white">{profile.followingCount}</strong> Takip Edilen
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-200 transition-colors">
                <strong className="text-white">{profile.followerCount}</strong> Takipçi
              </div>
            </div>
            
            <div className="w-px h-4 bg-gray-700"></div>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Katılım: {new Date().getFullYear()}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ALT KISIM: KULLANICININ POSTLARI (FEED) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
          <h2 className="text-xl font-bold text-gray-200">Gönderiler</h2>
          <span className="text-xs font-bold bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md border border-gray-700">
            {profile.posts?.totalElements || 0}
          </span>
        </div>

        {/* Postları Ekrana Basma */}
        {profile.posts?.content?.length > 0 ? (
          <div className="space-y-4">
            {profile.posts.content.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onPostUpdated={fetchProfile} // Düzenlenirse sayfayı tazele
                onPostDeleted={fetchProfile} // Silinirse sayfayı tazele
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/30 border border-gray-700/50 rounded-2xl">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Bu profilde henüz bir gönderi bulunmuyor.</p>
          </div>
        )}
      </div>

    </div>
  );
}