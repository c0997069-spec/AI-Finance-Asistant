import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, DollarSign, Award, Globe, MessageSquare, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface StockAnalyzerProps {
  onAnalyzeTicker: (ticker: string) => void;
  isLoadingAnalysis: boolean;
  aiAnalysisOutput?: string;
}

const DEFAULT_TICKERS = [
  { symbol: 'IDX:BBRI', label: 'BBRI (Bank Rakyat Indonesia)', desc: 'Blue Chip Indonesian Bank' },
  { symbol: 'IDX:GOTO', label: 'GOTO (Gojek Tokopedia)', desc: 'Indonesian Tech Giant' },
  { symbol: 'IDX:TLKM', label: 'TLKM (Telkom Indonesia)', desc: 'State-Owned Telecom' },
  { symbol: 'NASDAQ:AAPL', label: 'AAPL (Apple Inc.)', desc: 'Global Consumer Tech' },
  { symbol: 'NASDAQ:TSLA', label: 'TSLA (Tesla Motors)', desc: 'Electric Vehicles & Energy' },
  { symbol: 'BINANCE:BTCUSDT', label: 'BTC/USDT (Bitcoin)', desc: 'Leading Cryptocurrency' },
];

export default function StockAnalyzer({
  onAnalyzeTicker,
  isLoadingAnalysis,
  aiAnalysisOutput,
}: StockAnalyzerProps) {
  const [selectedTicker, setSelectedTicker] = useState('IDX:BBRI');
  const [customTicker, setCustomTicker] = useState('');
  const widgetRef = useRef<HTMLDivElement>(null);

  // Load TradingView dynamic script and render widget
  useEffect(() => {
    const loadTradingViewScript = () => {
      const scriptId = 'tradingview-widget-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        document.head.appendChild(script);
      }

      const initializeWidget = () => {
        if (typeof window !== 'undefined' && (window as any).TradingView) {
          try {
            new (window as any).TradingView.widget({
              width: '100%',
              height: 400,
              symbol: selectedTicker,
              interval: 'D',
              timezone: 'Asia/Jakarta',
              theme: 'dark',
              style: '1',
              locale: 'id',
              toolbar_bg: '#0f172a', // Tailwind slate-900 background
              enable_publishing: false,
              hide_side_toolbar: false,
              allow_symbol_change: true,
              container_id: 'tradingview_chart_container',
            });
          } catch (err) {
            console.error('TradingView widget failed to initialize:', err);
          }
        }
      };

      if (script.getAttribute('data-loaded') === 'true' || (window as any).TradingView) {
        initializeWidget();
      } else {
        script.addEventListener('load', () => {
          script?.setAttribute('data-loaded', 'true');
          initializeWidget();
        });
      }
    };

    loadTradingViewScript();
  }, [selectedTicker]);

  const handleSearchCustomTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTicker.trim()) {
      let formatted = customTicker.toUpperCase().trim();
      // Add IDX: prefix as helper for indonesian stock symbols if 4 characters with no source prefix
      if (formatted.length === 4 && !formatted.includes(':')) {
        // If it's a common indonesian ticker symbol
        formatted = `IDX:${formatted}`;
      }
      setSelectedTicker(formatted);
      setCustomTicker('');
    }
  };

  return (
    <div id="stock-analyzer-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100 h-full flex flex-col">
      {/* Header and Ticker Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Analisis Saham & Pasar TradingView
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Analisis real-time grafik saham IDX, NASDAQ, dan kripto global.
          </p>
        </div>

        {/* Custom ticker search */}
        <form onSubmit={handleSearchCustomTicker} className="flex items-center gap-2">
          <div className="relative">
            <input
              id="ticker-search-input"
              type="text"
              placeholder="Cari emiten, misal: BBCA, TSLA"
              value={customTicker}
              onChange={(e) => setCustomTicker(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 w-52"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            id="ticker-search-btn"
            type="submit"
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-3 py-2 rounded-xl transition-all cursor-pointer font-semibold"
          >
            Tampilkan
          </button>
        </form>
      </div>

      {/* Grid: Popular Tickers & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Popular Tickers Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-2 bg-slate-950/60 border border-slate-800/60 p-3 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider mb-1 font-mono">
            Rekomendasi Emiten
          </span>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
            {DEFAULT_TICKERS.map((t) => (
              <button
                key={t.symbol}
                id={`ticker-btn-${t.symbol.replace(':', '_')}`}
                onClick={() => setSelectedTicker(t.symbol)}
                className={`flex flex-col items-start p-2.5 rounded-xl transition-all border text-left min-w-[150px] lg:min-w-0 cursor-pointer ${
                  selectedTicker === t.symbol
                    ? 'bg-teal-950/40 border-teal-500 text-white shadow-inner shadow-teal-500/5'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold font-mono text-teal-400">
                    {t.symbol.split(':')[1] || t.symbol}
                  </span>
                  <span className="text-[8px] font-mono bg-slate-800/80 px-1 rounded text-slate-400">
                    {t.symbol.split(':')[0]}
                  </span>
                </div>
                <span className="text-[10px] font-sans text-slate-300 mt-1 truncate w-full">
                  {t.label.split('(')[0]}
                </span>
                <span className="text-[8px] text-slate-500 mt-0.5 truncate w-full">
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: TradingView Container */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden p-1 shadow-inner min-h-[400px] relative">
            <div id="tradingview_chart_container" className="w-full h-[400px]" ref={widgetRef}>
              {/* Dynamic script loads widget here */}
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                Memuat grafik TradingView untuk {selectedTicker}...
              </div>
            </div>
          </div>

          {/* AI Advisor Trigger */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl text-slate-950">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Analisis Pasar Inteligensi Yuki</h4>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Dapatkan rekomendasi investasi, valuasi P/E, deviden, dan sinyal beli/jual terkini berbasis AI.
                </p>
              </div>
            </div>

            <button
              id="trigger-ai-stock-analysis-btn"
              onClick={() => onAnalyzeTicker(selectedTicker)}
              disabled={isLoadingAnalysis}
              className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                isLoadingAnalysis
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-teal-500/10 hover:shadow-teal-500/20'
              }`}
            >
              {isLoadingAnalysis ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yuki sedang membaca pasar...
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
                  Minta Analisis AI Yuki ({selectedTicker.split(':')[1] || selectedTicker})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Result Board (if present) */}
      {aiAnalysisOutput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 border border-teal-900/40 bg-teal-950/10 p-5 rounded-2xl relative overflow-hidden"
        >
          {/* Subtle gradient light */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl pointer-events-none rounded-full" />
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-3 bg-teal-400 rounded-full" />
            <span className="text-xs font-bold text-teal-400 tracking-wide font-mono uppercase">Hasil Laporan AI - Yuki Advisor</span>
          </div>

          <div className="text-slate-200 text-xs leading-relaxed space-y-3 font-sans max-h-72 overflow-y-auto pr-2 scrollbar-thin">
            {aiAnalysisOutput.split('\n\n').map((para, idx) => {
              if (para.startsWith('**') || para.startsWith('- ') || para.startsWith('###')) {
                // simple custom rendering for markdown lines
                return (
                  <p key={idx} className="text-slate-100 whitespace-pre-wrap">
                    {para}
                  </p>
                );
              }
              return (
                <p key={idx} className="whitespace-pre-wrap">
                  {para}
                </p>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
