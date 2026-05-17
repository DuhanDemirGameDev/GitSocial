import React, { useEffect, useState } from "react";
import { Briefcase, MapPin, DollarSign, Search, Filter, Globe, Building2, Laptop, PlusCircle } from "lucide-react";
// YENİ: Kendi axios instance'ımızı import ediyoruz (Dosya yolunu projene göre düzenleyebilirsin)
import api from '../api/axiosInstance'; 

const WORK_MODES = ["REMOTE", "HYBRID", "ONSITE"];

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState({ number: 0, size: 20, totalPages: 0, totalElements: 0 });
  const [filters, setFilters] = useState({ title: "", minSalary: "", maxSalary: "", location: "", workMode: "" });
  const [form, setForm] = useState({ title: "", salaryRange: "", location: "", workMode: "REMOTE" });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [fetchError, setFetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    fetchJobs(0);
  }, []);

  async function fetchJobs(nextPage = 0) {
    setLoading(true);
    setFetchError("");

    // Boş filtreleri temizliyoruz
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => value !== "")
    );

    try {
      // YENİ: fetch yerine projeye ait 'api' nesnesini kullanıyoruz. Token otomatik eklenir!
      const response = await api.get('/jobs/filter', {
        params: { page: nextPage, size: 20, ...activeFilters }
      });
      
      // Axios veriyi otomatik parse eder, response.data kullanırız
      const data = response.data;
      setJobs(data.content ?? []);
      setPage(normalizePage(data));
    } catch (error) {
      setFetchError(error.response?.data?.message || "İş ilanları sunucudan çekilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function createJob(event) {
    event.preventDefault();
    setLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      // YENİ: fetch yerine api.post kullanıyoruz!
      await api.post('/jobs', {
        title: form.title,
        salaryRange: Number(form.salaryRange),
        location: form.location,
        workMode: form.workMode,
      });

      setForm({ title: "", salaryRange: "", location: "", workMode: "REMOTE" });
      setActionSuccess("İş ilanı başarıyla yayınlandı! 🎉");
      setShowCreateForm(false);
      
      await fetchJobs(0);
    } catch (error) {
      setActionError(error.response?.data?.message || "İş ilanı oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  const getWorkModeConfig = (mode) => {
    switch (mode) {
      case "REMOTE": return { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Uzaktan" };
      case "HYBRID": return { icon: Laptop, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "Hibrit" };
      case "ONSITE": return { icon: Building2, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Ofiste" };
      default: return { icon: Briefcase, color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", label: mode };
    }
  };

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
        
        {/* SOL PANEL: FİLTRELER VE İLAN OLUŞTURMA */}
        <aside className="space-y-6 lg:sticky top-6">
          
          {/* İlan Oluşturma Butonu / Formu */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-5 shadow-xl">
            {!showCreateForm ? (
              <button
                onClick={() => { setShowCreateForm(true); setActionError(""); setActionSuccess(""); }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg"
              >
                <PlusCircle className="w-5 h-5" />
                Yeni İş İlanı Yayınla
              </button>
            ) : (
              <form onSubmit={createJob} className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-200">İlan Detayları</h3>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="text-gray-500 hover:text-gray-300 text-sm">İptal</button>
                </div>
                
                <input name="title" value={form.title} onChange={updateForm} placeholder="Pozisyon (Örn: Frontend Dev)" className="w-full rounded-xl bg-gray-900/80 border border-gray-700 px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors" required />
                
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="salaryRange" value={form.salaryRange} onChange={updateForm} placeholder="Maaş ($)" type="number" min="0" className="w-full rounded-xl bg-gray-900/80 border border-gray-700 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors" required />
                  </div>
                  <select name="workMode" value={form.workMode} onChange={updateForm} className="flex-1 rounded-xl bg-gray-900/80 border border-gray-700 px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors text-gray-200">
                    <option value="REMOTE">Uzaktan</option>
                    <option value="HYBRID">Hibrit</option>
                    <option value="ONSITE">Ofiste</option>
                  </select>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="location" value={form.location} onChange={updateForm} placeholder="Konum (Şehir veya Ülke)" className="w-full rounded-xl bg-gray-900/80 border border-gray-700 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors" required />
                </div>

                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
                  {loading ? 'Yayınlanıyor...' : 'Yayınla'}
                </button>
              </form>
            )}

            {actionError && <p className="mt-4 text-sm text-center font-bold text-red-400">{actionError}</p>}
            {actionSuccess && <p className="mt-4 text-sm text-center font-bold text-emerald-400">{actionSuccess}</p>}
          </div>

          {/* Filtreleme Paneli */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-gray-300 font-bold">
              <Filter className="w-5 h-5 text-blue-400" />
              İlanları Filtrele
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input name="title" value={filters.title} onChange={updateFilter} placeholder="Pozisyon ara..." className="w-full rounded-xl bg-gray-900/80 border border-gray-700 pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div className="flex gap-2">
                <input name="minSalary" value={filters.minSalary} onChange={updateFilter} placeholder="Min Maaş" type="number" min="0" className="w-full rounded-xl bg-gray-900/80 border border-gray-700 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
                <input name="maxSalary" value={filters.maxSalary} onChange={updateFilter} placeholder="Max Maaş" type="number" min="0" className="w-full rounded-xl bg-gray-900/80 border border-gray-700 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input name="location" value={filters.location} onChange={updateFilter} placeholder="Konum" className="w-full rounded-xl bg-gray-900/80 border border-gray-700 pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-colors" />
              </div>

              <select name="workMode" value={filters.workMode} onChange={updateFilter} className="w-full rounded-xl bg-gray-900/80 border border-gray-700 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors text-gray-300">
                <option value="">Tüm Çalışma Modları</option>
                <option value="REMOTE">Uzaktan (Remote)</option>
                <option value="HYBRID">Hibrit (Hybrid)</option>
                <option value="ONSITE">Ofiste (Onsite)</option>
              </select>

              <button type="button" onClick={() => fetchJobs(0)} disabled={loading} className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-xl transition-all disabled:opacity-50">
                Sonuçları Getir
              </button>
            </div>
          </div>
        </aside>

        {/* SAĞ PANEL: İŞ İLANLARI LİSTESİ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h2 className="text-xl font-bold text-gray-200">Güncel İş Fırsatları</h2>
            <span className="text-sm font-medium bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
              {page.totalElements} İlan
            </span>
          </div>

          {fetchError && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl text-center font-bold">
              {fetchError}
            </div>
          )}

          {loading && jobs.length === 0 ? (
            <div className="flex justify-center py-10">
              <span className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></span>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const modeConfig = getWorkModeConfig(job.workMode);
                const ModeIcon = modeConfig.icon;
                const isCompany = job.createdBy?.accountType === 'COMPANY';

                return (
                  <article key={job.id} className="group bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 rounded-2xl p-5 transition-all duration-300 flex flex-col md:flex-row gap-5">
                    
                    <div className="hidden md:flex flex-shrink-0 w-16 h-16 rounded-2xl bg-gray-900 border border-gray-700 items-center justify-center overflow-hidden">
                      {job.createdBy?.profilePictureUrl ? (
                        <img src={job.createdBy.profilePictureUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase className={`w-8 h-8 ${isCompany ? 'text-blue-500' : 'text-gray-500'}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-100 group-hover:text-blue-400 transition-colors truncate">
                          {job.title}
                        </h2>
                        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg font-bold text-sm whitespace-nowrap">
                          <DollarSign className="w-4 h-4" />
                          {job.salaryRange.toLocaleString('en-US')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-3">
                        <span className="font-semibold text-gray-300">
                          {job.createdBy?.firstName} {job.createdBy?.lastName}
                        </span>
                        {isCompany && (
                          <span className="text-[10px] font-extrabold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20">
                            ŞİRKET
                          </span>
                        )}
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-gray-900/50 px-3 py-1 rounded-lg border border-gray-700/50">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg border ${modeConfig.bg} ${modeConfig.border} ${modeConfig.color} font-medium`}>
                          <ModeIcon className="w-4 h-4" />
                          {modeConfig.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-end md:justify-center">
                      <button className="px-5 py-2 rounded-xl bg-gray-700/50 hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-600 hover:border-transparent text-sm font-bold transition-all">
                        Detaylar
                      </button>
                    </div>
                  </article>
                );
              })}

              {jobs.length === 0 && !loading && !fetchError && (
                <div className="text-center py-12 bg-gray-800/40 border border-gray-700/50 rounded-2xl">
                  <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">Bu kriterlere uygun iş ilanı bulunamadı.</p>
                </div>
              )}
            </div>
          )}

          {page.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => fetchJobs(page.number - 1)}
                disabled={loading || page.number <= 0}
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 text-sm font-bold disabled:opacity-50 transition-all"
              >
                Önceki
              </button>
              <span className="text-sm font-medium text-gray-500">
                Sayfa {page.number + 1} / {page.totalPages}
              </span>
              <button
                onClick={() => fetchJobs(page.number + 1)}
                disabled={loading || page.number + 1 >= page.totalPages}
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 text-sm font-bold disabled:opacity-50 transition-all"
              >
                Sonraki
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

function normalizePage(data) {
  if (data.page) return { number: data.page.number ?? 0, size: data.page.size ?? 20, totalPages: data.page.totalPages ?? 0, totalElements: data.page.totalElements ?? 0 };
  return { number: data.number ?? 0, size: data.size ?? 20, totalPages: data.totalPages ?? 0, totalElements: data.totalElements ?? 0 };
}