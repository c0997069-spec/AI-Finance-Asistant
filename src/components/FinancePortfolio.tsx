import React, { useState } from 'react';
import { Plus, Trash2, Pencil, X, TrendingUp, TrendingDown, Wallet, LineChart, PieChart, Landmark, DollarSign, Calendar, Tag, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Transaction, Investment, AssetType, TransactionType } from '../types';
import { ResponsiveContainer, PieChart as ReChartsPie, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface FinancePortfolioProps {
  transactions: Transaction[];
  investments: Investment[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onAddInvestment: (i: Omit<Investment, 'id'>) => void;
  onDeleteInvestment: (id: string) => void;
  onUpdateInvestment: (i: Investment) => void;
  onClearAllData: () => void;
  onAnalyzePortfolio: () => void;
  isAnalyzingPortfolio: boolean;
  portfolioAnalysisMarkdown: string | null;
}

const ASSET_COLORS = {
  stock: '#4FD1C5', // teal
  crypto: '#F6E05E', // yellow
  mutual_fund: '#9F7AEA', // purple
  gold: '#ED8936', // orange
  cash: '#4299E1', // blue
};

export default function FinancePortfolio({
  transactions,
  investments,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  onAddInvestment,
  onDeleteInvestment,
  onUpdateInvestment,
  onClearAllData,
  onAnalyzePortfolio,
  isAnalyzingPortfolio,
  portfolioAnalysisMarkdown,
}: FinancePortfolioProps) {
  // Tabs within finance
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'transactions' | 'investments'>('summary');

  // Form states for Transaction
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txCategory, setTxCategory] = useState('Makanan');

  // Form states for Investment
  const [invTicker, setInvTicker] = useState('');
  const [invName, setInvName] = useState('');
  const [invBuyPrice, setInvBuyPrice] = useState('');
  const [invQty, setInvQty] = useState('');
  const [invAssetType, setInvAssetType] = useState<AssetType>('stock');

  // Editing state for Transaction
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTxDesc, setEditTxDesc] = useState('');
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxType, setEditTxType] = useState<TransactionType>('expense');
  const [editTxCategory, setEditTxCategory] = useState('');
  const [editTxDate, setEditTxDate] = useState('');

  // Editing state for Investment
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [editInvTicker, setEditInvTicker] = useState('');
  const [editInvName, setEditInvName] = useState('');
  const [editInvBuyPrice, setEditInvBuyPrice] = useState('');
  const [editInvQty, setEditInvQty] = useState('');
  const [editInvCurrentPrice, setEditInvCurrentPrice] = useState('');
  const [editInvAssetType, setEditInvAssetType] = useState<AssetType>('stock');
  const [editInvDate, setEditInvDate] = useState('');

  const startEditTx = (t: Transaction) => {
    setEditingTx(t);
    setEditTxDesc(t.description);
    setEditTxAmount(t.amount.toString());
    setEditTxType(t.type);
    setEditTxCategory(t.category);
    setEditTxDate(t.date);
  };

  const handleUpdateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editTxDesc || !editTxAmount) return;
    onUpdateTransaction({
      id: editingTx.id,
      date: editTxDate,
      description: editTxDesc,
      amount: parseFloat(editTxAmount),
      type: editTxType,
      category: editTxCategory,
    });
    setEditingTx(null);
  };

  const startEditInv = (i: Investment) => {
    setEditingInv(i);
    setEditInvTicker(i.ticker);
    setEditInvName(i.name);
    setEditInvBuyPrice(i.buyPrice.toString());
    setEditInvQty(i.quantity.toString());
    setEditInvCurrentPrice(i.currentPrice.toString());
    setEditInvAssetType(i.assetType);
    setEditInvDate(i.date);
  };

  const handleUpdateInv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInv || !editInvTicker || !editInvBuyPrice || !editInvQty || !editInvCurrentPrice) return;
    onUpdateInvestment({
      id: editingInv.id,
      date: editInvDate,
      ticker: editInvTicker.toUpperCase(),
      name: editInvName,
      buyPrice: parseFloat(editInvBuyPrice),
      quantity: parseFloat(editInvQty),
      currentPrice: parseFloat(editInvCurrentPrice),
      assetType: editInvAssetType,
    });
    setEditingInv(null);
  };

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashBalance = totalIncome - totalExpense;

  const totalInvestmentCost = investments.reduce((sum, i) => sum + i.buyPrice * i.quantity, 0);
  const totalInvestmentCurrent = investments.reduce((sum, i) => sum + i.currentPrice * i.quantity, 0);
  const investmentProfit = totalInvestmentCurrent - totalInvestmentCost;
  const investmentProfitPercent = totalInvestmentCost > 0 ? (investmentProfit / totalInvestmentCost) * 100 : 0;

  const totalNetWorth = cashBalance + totalInvestmentCurrent;

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount) return;
    onAddTransaction({
      date: new Date().toLocaleDateString('id-ID'),
      description: txDesc,
      amount: parseFloat(txAmount),
      type: txType,
      category: txCategory,
    });
    setTxDesc('');
    setTxAmount('');
  };

  const handleAddInv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invTicker || !invBuyPrice || !invQty) return;
    onAddInvestment({
      date: new Date().toLocaleDateString('id-ID'),
      ticker: invTicker.toUpperCase(),
      name: invName || invTicker.toUpperCase(),
      buyPrice: parseFloat(invBuyPrice),
      quantity: parseFloat(invQty),
      currentPrice: parseFloat(invBuyPrice), // Initial current price equals buy price
      assetType: invAssetType,
    });
    setInvTicker('');
    setInvName('');
    setInvBuyPrice('');
    setInvQty('');
  };

  // Chart Data preparation
  const getAssetDistribution = () => {
    const assetsMap: Record<AssetType, number> = {
      stock: 0,
      crypto: 0,
      mutual_fund: 0,
      gold: 0,
      cash: Math.max(0, cashBalance),
    };

    investments.forEach((inv) => {
      assetsMap[inv.assetType] += inv.currentPrice * inv.quantity;
    });

    return Object.entries(assetsMap)
      .map(([name, value]) => ({
        name: name.toUpperCase().replace('_', ' '),
        value,
        color: ASSET_COLORS[name as AssetType],
      }))
      .filter((item) => item.value > 0);
  };

  const assetData = getAssetDistribution();

  // Format helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div id="finance-portfolio-main" className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 text-white h-full flex flex-col">
      {/* Subtab Header Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-400" />
            Pengelola Keuangan & Portofolio
          </h2>
          <p className="text-[11px] text-white/60">Lacak aset tunai, reksa dana, saham, dan keuntungan investasimu.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            id="subtab-summary"
            onClick={() => setActiveSubTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'summary' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Ringkasan
          </button>
          <button
            id="subtab-transactions"
            onClick={() => setActiveSubTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'transactions' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Arus Kas
          </button>
          <button
            id="subtab-investments"
            onClick={() => setActiveSubTab('investments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'investments' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Investasi
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin">
        {activeSubTab === 'summary' && (
          <div className="space-y-6">
            {/* Net Worth Highlight Card */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10">
                <Landmark className="w-24 h-24" />
              </div>
              <span className="text-[10px] tracking-widest text-white/40 uppercase font-mono">Estimasi Kekayaan Bersih</span>
              <div className="text-2xl lg:text-3xl font-extrabold text-white mt-1">{formatIDR(totalNetWorth)}</div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                <div>
                  <span className="text-[10px] text-white/40 block">Saldo Kas Tunai</span>
                  <span className={`text-sm font-bold ${cashBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatIDR(cashBalance)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 block">Nilai Portofolio Investasi</span>
                  <span className="text-sm font-bold text-teal-400">{formatIDR(totalInvestmentCurrent)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reset to Zero Button */}
              <button
                id="reset-portfolio-btn"
                onClick={() => {
                  if (window.confirm('Apakah Kakak yakin ingin me-reset semua saldo portofolio ke nol? Semua transaksi dan kepemilikan aset akan dihapus.')) {
                    onClearAllData();
                  }
                }}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-300 rounded-2xl p-3.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                Reset Semua Saldo ke Nol
              </button>

              {/* Ask Yuki Portfolio Analysis Button */}
              <button
                id="analyze-portfolio-btn"
                onClick={onAnalyzePortfolio}
                disabled={isAnalyzingPortfolio}
                className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-200 rounded-2xl p-3.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzingPortfolio ? (
                  <>
                    <RefreshCcw className="w-4 h-4 text-indigo-400 animate-spin" />
                    Yuki Sedang Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    Analisis Portofolio oleh Yuki
                  </>
                )}
              </button>
            </div>

            {/* Yuki's Live Analysis output inside portfolio panel */}
            <AnimatePresence>
              {portfolioAnalysisMarkdown && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-gradient-to-r from-pink-500/10 via-indigo-500/10 to-purple-500/10 border border-pink-500/20 p-5 rounded-2xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-pink-300 font-extrabold text-xs font-mono tracking-wider uppercase">
                      <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                      Hasil Analisis Portofolio oleh Yuki
                    </div>
                    <button 
                      onClick={() => onClearAllData && (document.getElementById('reset-portfolio-btn')?.scrollIntoView({ behavior: 'smooth' }))}
                      className="text-[9px] font-mono text-white/40 hover:text-white/60 transition-all uppercase cursor-pointer"
                    >
                      Kembali ke Atas
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none text-xs text-white/95 leading-relaxed max-h-[350px] overflow-y-auto bg-black/40 p-4 rounded-xl border border-white/5 font-sans scrollbar-thin">
                    <ReactMarkdown>{portfolioAnalysisMarkdown}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid Charts / Statuses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset Allocation Chart */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <h3 className="text-xs font-bold text-white/70 mb-3 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-indigo-400" /> Allocasi Portofolio
                </h3>
                {assetData.length > 0 ? (
                  <div className="h-44 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChartsPie>
                        <Pie
                          data={assetData}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {assetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </ReChartsPie>
                    </ResponsiveContainer>
                    {/* Absolute Legend inside the list */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] text-white/40 font-mono">INVESTASI</span>
                      <span className="text-xs font-bold text-white">{formatIDR(totalInvestmentCurrent)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-white/30 text-xs">
                    Belum ada data portofolio.
                  </div>
                )}
                {/* Legends */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {assetData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[9px] text-white/60 truncate font-mono">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Income vs Expenses Status */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <h3 className="text-xs font-bold text-white/70 mb-3 flex items-center gap-1.5">
                  <LineChart className="w-4 h-4 text-purple-400" /> Ringkasan Profitabilitas
                </h3>
                
                <div className="space-y-3.5 my-auto">
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/60 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" /> Pemasukan Bulanan
                    </span>
                    <span className="text-xs font-mono font-bold text-green-400">{formatIDR(totalIncome)}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/60 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Pengeluaran Bulanan
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">{formatIDR(totalExpense)}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/60 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Profit Investasi (P/L)
                    </span>
                    <span className={`text-xs font-mono font-bold ${investmentProfit >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                      {investmentProfit >= 0 ? '+' : ''}{formatIDR(investmentProfit)} ({investmentProfitPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="text-[9px] text-white/40 mt-3 border-t border-white/5 pt-2 text-center">
                  Minta Yuki untuk menganalisis emiten portofoliomu melalui asisten chat Yuki!
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'transactions' && (
          <div className="space-y-6">
            {/* Add Transaction Form */}
            <form onSubmit={handleAddTx} className="bg-white/5 border border-white/5 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="text-[10px] text-white/40 font-mono block mb-1">Deskripsi Arus Kas</label>
                <input
                  id="tx-desc-input"
                  type="text"
                  placeholder="Gaji Bulanan, Makan Siang, dll."
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 font-mono block mb-1">Nominal (IDR)</label>
                <input
                  id="tx-amount-input"
                  type="number"
                  placeholder="Jumlah Uang"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 font-mono block mb-1">Tipe</label>
                  <select
                    id="tx-type-select"
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as TransactionType)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="income" className="bg-slate-900">Masuk</option>
                    <option value="expense" className="bg-slate-900">Keluar</option>
                  </select>
                </div>

                <button
                  id="add-tx-btn"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl py-2 flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>
            </form>

            {/* List Transactions */}
            <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest font-mono text-white/60 uppercase">Daftar Transaksi Kas Terkini</span>
                <span className="text-[10px] text-white/40 font-mono">{transactions.length} Item</span>
              </div>

              {transactions.length > 0 ? (
                <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                  {transactions.slice().reverse().map((t) => (
                    <div key={t.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg ${t.type === 'income' ? 'bg-green-500/15 text-green-400' : 'bg-rose-500/15 text-rose-400'}`}>
                          {t.type === 'income' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white/90">{t.description}</div>
                          <div className="text-[9px] text-white/40 font-mono flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" /> {t.date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold ${t.type === 'income' ? 'text-green-400' : 'text-rose-400'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`edit-tx-${t.id}`}
                            onClick={() => startEditTx(t)}
                            className="text-white/20 hover:text-indigo-400 p-1 rounded transition-all cursor-pointer"
                            title="Edit Transaksi"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-tx-${t.id}`}
                            onClick={() => onDeleteTransaction(t.id)}
                            className="text-white/20 hover:text-rose-400 p-1 rounded transition-all cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-white/30 text-xs">Belum ada transaksi kas tercatat. Masukkan gaji atau pengeluaran di atas!</div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'investments' && (
          <div className="space-y-6">
            {/* Add Investment Form */}
            <form onSubmit={handleAddInv} className="bg-white/5 border border-white/5 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-[10px] text-white/40 font-mono block mb-1">Ticker / Simbol</label>
                <input
                  id="inv-ticker-input"
                  type="text"
                  placeholder="Misal: BBRI, AAPL"
                  value={invTicker}
                  onChange={(e) => setInvTicker(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 font-mono block mb-1">Nama Aset (Opsional)</label>
                <input
                  id="inv-name-input"
                  type="text"
                  placeholder="Bank Rakyat Indonesia"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 font-mono block mb-1">Harga Beli (IDR)</label>
                <input
                  id="inv-price-input"
                  type="number"
                  placeholder="Per Unit/Lot"
                  value={invBuyPrice}
                  onChange={(e) => setInvBuyPrice(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 font-mono block mb-1">Jumlah Unit/Lot</label>
                <input
                  id="inv-qty-input"
                  type="number"
                  placeholder="Kuantitas"
                  value={invQty}
                  onChange={(e) => setInvQty(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 font-mono block mb-1">Tipe Aset</label>
                <select
                  id="inv-asset-type-select"
                  value={invAssetType}
                  onChange={(e) => setInvAssetType(e.target.value as AssetType)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="stock" className="bg-slate-900">Saham (Stock)</option>
                  <option value="crypto" className="bg-slate-900">Kripto (Crypto)</option>
                  <option value="mutual_fund" className="bg-slate-900">Reksa Dana</option>
                  <option value="gold" className="bg-slate-900">Emas (Gold)</option>
                </select>
              </div>

              <div className="md:col-span-5 flex justify-end">
                <button
                  id="add-inv-btn"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-6 py-2 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Emiten Portofolio
                </button>
              </div>
            </form>

            {/* List Investments */}
            <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest font-mono text-white/60 uppercase">Portofolio Investasi Kakak</span>
                <span className="text-[10px] text-white/40 font-mono">{investments.length} Emiten</span>
              </div>

              {investments.length > 0 ? (
                <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                  {investments.map((inv) => {
                    const cost = inv.buyPrice * inv.quantity;
                    const val = inv.currentPrice * inv.quantity;
                    const profit = val - cost;
                    const profitPct = cost > 0 ? (profit / cost) * 100 : 0;

                    return (
                      <div key={inv.id} className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: ASSET_COLORS[inv.assetType] }}
                            title={inv.assetType.toUpperCase()}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white uppercase font-mono">{inv.ticker}</span>
                              <span className="text-[8px] px-1 bg-white/10 rounded text-white/60 uppercase font-mono">{inv.assetType}</span>
                            </div>
                            <div className="text-[9px] text-white/40 truncate max-w-[150px]">{inv.name}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-mono text-white font-bold">{formatIDR(val)}</div>
                          <div className="text-[9px] text-white/50 font-mono">
                            {inv.quantity} unit @ {formatIDR(inv.buyPrice)}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-[11px] font-mono font-bold ${profit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                              {profit >= 0 ? '+' : ''}{profitPct.toFixed(1)}%
                            </span>
                            <div className="text-[9px] text-white/40 font-mono">{formatIDR(profit)}</div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`edit-inv-${inv.id}`}
                              onClick={() => startEditInv(inv)}
                              className="text-white/20 hover:text-indigo-400 p-1 rounded transition-all cursor-pointer"
                              title="Edit Investasi"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`delete-inv-${inv.id}`}
                              onClick={() => onDeleteInvestment(inv.id)}
                              className="text-white/20 hover:text-rose-400 p-1 rounded transition-all cursor-pointer"
                              title="Hapus Investasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-white/30 text-xs">Belum ada portofolio investasi tercatat. Tambahkan di atas!</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <AnimatePresence>
        {editingTx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#100c2a]/95 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl relative text-white"
            >
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-base font-bold flex items-center gap-2 mb-4 text-indigo-400">
                <Pencil className="w-4 h-4" />
                Edit Transaksi
              </h3>

              <form onSubmit={handleUpdateTx} className="space-y-4">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Deskripsi</label>
                  <input
                    type="text"
                    required
                    value={editTxDesc}
                    onChange={(e) => setEditTxDesc(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Nominal (IDR)</label>
                    <input
                      type="number"
                      required
                      value={editTxAmount}
                      onChange={(e) => setEditTxAmount(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Tanggal</label>
                    <input
                      type="text"
                      required
                      value={editTxDate}
                      onChange={(e) => setEditTxDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Tipe</label>
                    <select
                      value={editTxType}
                      onChange={(e) => setEditTxType(e.target.value as TransactionType)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-2 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="income" className="bg-slate-900">Masuk (Income)</option>
                      <option value="expense" className="bg-slate-900">Keluar (Expense)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Kategori</label>
                    <input
                      type="text"
                      required
                      value={editTxCategory}
                      onChange={(e) => setEditTxCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-2 text-sm transition-all font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 text-sm transition-all font-semibold cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Investment Modal */}
      <AnimatePresence>
        {editingInv && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#100c2a]/95 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl relative text-white"
            >
              <button
                type="button"
                onClick={() => setEditingInv(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-base font-bold flex items-center gap-2 mb-4 text-teal-400">
                <Pencil className="w-4 h-4" />
                Edit Portofolio Emiten
              </h3>

              <form onSubmit={handleUpdateInv} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Ticker / Simbol</label>
                    <input
                      type="text"
                      required
                      value={editInvTicker}
                      onChange={(e) => setEditInvTicker(e.target.value.toUpperCase())}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Tipe Aset</label>
                    <select
                      value={editInvAssetType}
                      onChange={(e) => setEditInvAssetType(e.target.value as AssetType)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-2 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="stock" className="bg-slate-900">Saham (Stock)</option>
                      <option value="crypto" className="bg-slate-900">Kripto (Crypto)</option>
                      <option value="mutual_fund" className="bg-slate-900">Reksa Dana</option>
                      <option value="gold" className="bg-slate-900">Emas (Gold)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1">Nama Aset</label>
                  <input
                    type="text"
                    required
                    value={editInvName}
                    onChange={(e) => setEditInvName(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Harga Beli (IDR)</label>
                    <input
                      type="number"
                      required
                      value={editInvBuyPrice}
                      onChange={(e) => setEditInvBuyPrice(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Kuantitas</label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={editInvQty}
                      onChange={(e) => setEditInvQty(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Harga Saat Ini (IDR)</label>
                    <input
                      type="number"
                      required
                      value={editInvCurrentPrice}
                      onChange={(e) => setEditInvCurrentPrice(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Tanggal</label>
                    <input
                      type="text"
                      required
                      value={editInvDate}
                      onChange={(e) => setEditInvDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingInv(null)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-2 text-sm transition-all font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-2 text-sm transition-all font-semibold cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
