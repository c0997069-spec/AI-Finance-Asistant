import React, { useState, useEffect } from 'react';
import { Calendar, Globe, AlertTriangle, RefreshCw, Filter, ShieldAlert, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  country: string;
  event: string;
  period: string;
  importance: 'high' | 'medium' | 'low';
  actual: string | null;
  forecast: string;
  previous: string;
}

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [importanceFilter, setImportanceFilter] = useState<string>('ALL');

  const fetchCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/economic-calendar');
      if (!res.ok) throw new Error('Failed to fetch economic calendar');
      const data = await res.json();
      setEvents(data.calendar || []);
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat kalender ekonomi terkini. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesCountry = countryFilter === 'ALL' || e.country === countryFilter;
    const matchesImportance = importanceFilter === 'ALL' || e.importance === importanceFilter;
    return matchesCountry && matchesImportance;
  });

  const getImportanceBadge = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider animate-pulse">
            <ShieldAlert className="w-3 h-3 text-red-400" /> High Impact
          </span>
        );
      case 'medium':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Med Impact
          </span>
        );
      case 'low':
        return (
          <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider">
            Low Impact
          </span>
        );
    }
  };

  const getCountryEmoji = (code: string) => {
    const flags: Record<string, string> = {
      US: '🇺🇸',
      ID: '🇮🇩',
      EU: '🇪🇺',
      JP: '🇯🇵',
      CN: '🇨🇳',
    };
    return flags[code] || '🌐';
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="economic-calendar-panel" className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 text-white h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-400 animate-pulse" />
            Kalender Ekonomi Global & Domestik
          </h2>
          <p className="text-[11px] text-white/60">
            Pantau rilis data makroekonomi penting (BI, Fed, CPI) yang mempengaruhi pergerakan pasar saham dan portofoliomu.
          </p>
        </div>

        <button
          onClick={fetchCalendar}
          disabled={loading}
          className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-pink-400 font-mono">
          <Filter className="w-3.5 h-3.5 text-pink-400" />
          FILTER INDIKATOR:
        </div>

        <div className="flex flex-wrap gap-4 flex-1 justify-start">
          {/* Country filter */}
          <div>
            <select
              id="calendar-country-filter"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer font-sans"
            >
              <option value="ALL" className="bg-slate-900">Semua Negara (ALL)</option>
              <option value="ID" className="bg-slate-900">🇮🇩 Indonesia</option>
              <option value="US" className="bg-slate-900">🇺🇸 Amerika Serikat</option>
              <option value="EU" className="bg-slate-900">🇪🇺 Uni Eropa</option>
              <option value="JP" className="bg-slate-900">🇯🇵 Jepang</option>
              <option value="CN" className="bg-slate-900">🇨🇳 China</option>
            </select>
          </div>

          {/* Importance filter */}
          <div>
            <select
              id="calendar-importance-filter"
              value={importanceFilter}
              onChange={(e) => setImportanceFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer font-sans"
            >
              <option value="ALL" className="bg-slate-900">Semua Dampak</option>
              <option value="high" className="bg-slate-900">🔴 High Impact Only</option>
              <option value="medium" className="bg-slate-900">🟡 Medium Impact Only</option>
              <option value="low" className="bg-slate-900">🔵 Low Impact Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/50 text-xs gap-3">
            <svg className="animate-spin h-8 w-8 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Yuki sedang mengunduh jadwal rilis data makroekonomi...
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center text-red-400 text-xs gap-3">
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <span>{error}</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/40 text-xs">
            Tidak ada peristiwa ekonomi yang cocok dengan filter Anda.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((e, index) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.04 }}
                className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl mt-1 select-none">
                    {getCountryEmoji(e.country)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-mono text-white/60">
                        {e.country}
                      </span>
                      <span className="text-[10px] text-white/50 font-mono">
                        {formatDateLabel(e.date)} • {e.time} WIB
                      </span>
                      {getImportanceBadge(e.importance)}
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                      {e.event}
                    </h4>
                    <span className="text-[9px] text-pink-300 font-mono tracking-wider block mt-1">
                      PERIODE RILIS: {e.period.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Right Metrics */}
                <div className="grid grid-cols-3 gap-6 bg-black/30 border border-white/5 px-4 py-2.5 rounded-xl w-full md:w-auto text-center self-stretch md:self-auto items-center">
                  <div>
                    <span className="text-[8px] text-white/40 block font-mono uppercase">Sebelumnya</span>
                    <span className="text-xs font-mono font-semibold text-white/80">{e.previous || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/40 block font-mono uppercase">Konsensus</span>
                    <span className="text-xs font-mono font-semibold text-white/80">{e.forecast || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-white/40 block font-mono uppercase">Aktual</span>
                    {e.actual ? (
                      <span className="text-xs font-mono font-extrabold text-green-400">{e.actual}</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-white/30 italic">Pending</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="text-[9px] text-white/30 border-t border-white/5 pt-3 mt-4 text-center font-mono">
        *Disclaimer: Data kalender ekonomi disimulasikan sesuai kondisi pasar riil untuk membantu keputusan investasi Anda.
      </div>
    </div>
  );
}
