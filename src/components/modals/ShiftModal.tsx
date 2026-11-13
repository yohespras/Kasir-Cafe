import React, { useState } from 'react';
import { X, Clock, User, Banknote, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useCafe } from '../../context/CafeContext';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose }) => {
  const { currentShift, activeCashier, startNewShift, closeCurrentShift, theme } = useCafe();

  const [mode, setMode] = useState<'view' | 'close' | 'new'>(currentShift.isOpen ? 'view' : 'new');
  const [newCashierName, setNewCashierName] = useState(activeCashier);
  const [openingCashInput, setOpeningCashInput] = useState('300000');
  const [closingCashInput, setClosingCashInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const expectedCash = currentShift.openingCash + currentShift.totalRevenue;
  const actualClosingCash = parseInt(closingCashInput.replace(/\D/g, '') || '0', 10);
  const difference = actualClosingCash - expectedCash;

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    const openingNum = parseInt(openingCashInput.replace(/\D/g, '') || '0', 10);
    startNewShift(newCashierName.trim() || 'Kasir', openingNum);
    onClose();
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeCurrentShift(actualClosingCash, closingNotes.trim());
    setMode('view');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border transition-all ${
          isDark ? 'bg-stone-900 border-stone-850 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
        role="dialog"
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentShift.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
              <span className="text-xs uppercase font-bold tracking-wider text-amber-500">
                {currentShift.isOpen ? 'Shift Aktif' : 'Shift Ditutup'}
              </span>
            </div>
            <h3 className="text-xl font-black">Manajemen Shift & Kasir</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {mode === 'view' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <span className={`text-xs flex items-center gap-1.5 mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    <User className="w-3.5 h-3.5 text-amber-500" /> Kasir Bertugas
                  </span>
                  <p className="text-base font-bold">{currentShift.cashierName}</p>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <span className={`text-xs flex items-center gap-1.5 mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Jam Buka
                  </span>
                  <p className="text-base font-bold">
                    {new Date(currentShift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex justify-between items-center text-sm">
                  <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Modal Awal Laci:</span>
                  <span className="font-bold">Rp {currentShift.openingCash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Jumlah Transaksi:</span>
                  <span className="font-bold">{currentShift.totalTransactions} Pesanan</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Total Penjualan Shift:</span>
                  <span className="font-bold text-emerald-500">Rp {currentShift.totalRevenue.toLocaleString('id-ID')}</span>
                </div>
                <div className={`pt-2 border-t flex justify-between items-center text-base font-black ${
                  isDark ? 'border-stone-800' : 'border-stone-200'
                }`}>
                  <span className="text-amber-500">Estimasi Total Kas:</span>
                  <span className="text-amber-500">Rp {expectedCash.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {currentShift.isOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    setClosingCashInput(expectedCash.toString());
                    setMode('close');
                  }}
                  className={`w-full py-3 px-4 font-bold rounded-2xl transition-colors text-sm flex items-center justify-center gap-2 border ${
                    isDark 
                      ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/30' 
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Tutup Shift & Rekap Kas Fisik</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('new')}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Mulai Shift Kasir Baru</span>
                </button>
              )}
            </div>
          )}

          {mode === 'close' && (
            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className={`p-3 rounded-2xl text-xs border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}>
                Hitung uang fisik di laci kasir dan masukkan nominalnya untuk melihat kecocokan dengan sistem.
              </div>

              <div>
                <label className={`text-xs block mb-1.5 font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Total Uang Fisik di Laci (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">Rp</span>
                  <input
                    type="text"
                    required
                    value={closingCashInput}
                    onChange={e => setClosingCashInput(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl text-lg font-bold border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-700 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Difference breakdown */}
              <div className={`p-3 rounded-xl text-xs space-y-1.5 border ${
                isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Target Sistem:</span>
                  <span>Rp {expectedCash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Selisih Kas:</span>
                  <span className={difference === 0 ? 'text-emerald-500' : difference > 0 ? 'text-blue-500' : 'text-rose-500'}>
                    {difference === 0 ? 'Pas (Sesuai 100%)' : difference > 0 ? `+Rp ${difference.toLocaleString('id-ID')} (Lebih)` : `-Rp ${Math.abs(difference).toLocaleString('id-ID')} (Kurang)`}
                  </span>
                </div>
              </div>

              <div>
                <label className={`text-xs block mb-1.5 font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Catatan Penutupan (Opsional)
                </label>
                <textarea
                  value={closingNotes}
                  onChange={e => setClosingNotes(e.target.value)}
                  placeholder="Catatan serah terima shift..."
                  rows={2}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl ${
                    isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-sm transition-colors shadow-md"
                >
                  Konfirmasi Tutup Shift
                </button>
              </div>
            </form>
          )}

          {mode === 'new' && (
            <form onSubmit={handleStartShift} className="space-y-4">
              <div>
                <label className={`text-xs block mb-1.5 font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Nama Kasir Bertugas
                </label>
                <input
                  type="text"
                  required
                  value={newCashierName}
                  onChange={e => setNewCashierName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                  placeholder="Sarah Amanda / Budi"
                />
              </div>

              <div>
                <label className={`text-xs block mb-1.5 font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Modal Kas Awal di Laci (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">Rp</span>
                  <input
                    type="text"
                    required
                    value={openingCashInput}
                    onChange={e => setOpeningCashInput(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-12 pr-4 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                    placeholder="300000"
                  />
                </div>
                <span className={`text-[11px] mt-1 block ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  Uang pecahan kecil untuk kembalian pelanggan.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl ${
                    isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-sm transition-all shadow-md"
                >
                  Buka Shift Kasir Sekarang
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
