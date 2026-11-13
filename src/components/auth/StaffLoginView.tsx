import React, { useState } from 'react';
import { 
  Coffee, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Sun, 
  Moon, 
  Sparkles, 
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { StaffUser } from '../../types/cafe';

export const StaffLoginView: React.FC = () => {
  const { 
    staffUsers, 
    loginStaff, 
    loginStaffById, 
    theme, 
    toggleTheme, 
    googleUser, 
    isGoogleAuthenticated, 
    loginGoogle 
  } = useCafe();

  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffUsers[0]?.id || 'staff-1');
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedStaff = staffUsers.find(u => u.id === selectedStaffId) || staffUsers[0];

  const handleKeypadPress = (val: string) => {
    if (pin.length < 6) {
      const newPin = pin + val;
      setPin(newPin);
      setErrorMessage(null);
      // Auto submit if 4 digits
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  const verifyPin = (pinToTest: string) => {
    if (selectedStaff && selectedStaff.pin === pinToTest) {
      loginStaffById(selectedStaff.id);
    } else {
      setErrorMessage('PIN Kasir salah. Silakan coba lagi.');
      setPin('');
    }
  };

  const handleQuickLogin = (staff: StaffUser) => {
    setSelectedStaffId(staff.id);
    loginStaffById(staff.id);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-stone-950 text-stone-100' 
        : 'bg-[#faf7f2] text-stone-900'
    }`}>
      {/* Top Controls: Dark/Light Mode & Brand */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            theme === 'dark'
              ? 'bg-stone-900 border-stone-800 text-amber-400 hover:bg-stone-850'
              : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm'
          }`}
          title="Ubah tema Gelap / Terang"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Mode Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Mode Gelap</span>
            </>
          )}
        </button>
      </div>

      <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
        theme === 'dark'
          ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-black/60'
          : 'bg-white border-stone-200 text-stone-900 shadow-stone-300/40'
      }`}>
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-600/30">
            <Coffee className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">KOPI SENJA POS</h1>
          <p className={`text-xs ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
            Sistem Kasir & Operasional Cafe Specialty
          </p>
        </div>

        {/* Staff User Selector */}
        <div className="space-y-2 mb-5">
          <label className={`text-xs font-bold uppercase tracking-wider block ${
            theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
          }`}>
            Pilih Staf / Kasir Bertugas:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {staffUsers.map(staff => {
              const isSelected = selectedStaff.id === staff.id;
              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => {
                    setSelectedStaffId(staff.id);
                    setPin('');
                    setErrorMessage(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-500 ring-1 ring-amber-500'
                      : theme === 'dark'
                      ? 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-850'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/40 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${
                      isSelected ? (theme === 'dark' ? 'text-amber-300' : 'text-amber-700') : (theme === 'dark' ? 'text-stone-200' : 'text-stone-800')
                    }`}>
                      {staff.name}
                    </p>
                    <span className="text-[10px] block opacity-80 truncate">{staff.roleLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN Input Display */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className={theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}>
              Masukkan PIN Keamanan (4 Digit):
            </span>
            <span className="text-amber-500 font-mono font-bold text-[11px]">
              PIN default: {selectedStaff.pin}
            </span>
          </div>

          <div className={`py-3 px-4 rounded-2xl border flex items-center justify-center gap-3 tracking-[0.5em] text-2xl font-mono ${
            theme === 'dark' ? 'bg-stone-950 border-stone-800' : 'bg-stone-100 border-stone-300 text-stone-900'
          }`}>
            {[0, 1, 2, 3].map(idx => (
              <span
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  pin.length > idx 
                    ? 'bg-amber-500 scale-125 shadow-sm shadow-amber-500/50' 
                    : theme === 'dark' ? 'bg-stone-800' : 'bg-stone-300'
                }`}
              />
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className={`py-3 rounded-2xl font-bold text-lg border transition-all active:scale-95 ${
                theme === 'dark'
                  ? 'bg-stone-950 hover:bg-stone-850 border-stone-800 text-stone-100'
                  : 'bg-stone-50 hover:bg-stone-200 border-stone-200 text-stone-800 shadow-sm'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
              theme === 'dark'
                ? 'bg-stone-950 text-rose-400 border-stone-800 hover:bg-rose-950/20'
                : 'bg-stone-100 text-rose-600 border-stone-200 hover:bg-rose-50'
            }`}
          >
            Hapus
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className={`py-3 rounded-2xl font-bold text-lg border transition-all active:scale-95 ${
              theme === 'dark'
                ? 'bg-stone-950 hover:bg-stone-850 border-stone-800 text-stone-100'
                : 'bg-stone-50 hover:bg-stone-200 border-stone-200 text-stone-800 shadow-sm'
            }`}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
              theme === 'dark'
                ? 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-850'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
          >
            ⌫
          </button>
        </div>

        {/* 1-Click Fast Login for Demo */}
        <div className="pt-2 border-t border-stone-800/60">
          <button
            type="button"
            onClick={() => handleQuickLogin(selectedStaff)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-2xl shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <UserCheck className="w-4 h-4" />
            <span>Masuk Cepat Sebagai {selectedStaff.name}</span>
          </button>
        </div>

        {/* Google Workspace sign in option on lock screen */}
        <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs">
          <span className={theme === 'dark' ? 'text-stone-500' : 'text-stone-400'}>
            Google Drive & Sheets:
          </span>
          {isGoogleAuthenticated ? (
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
            </span>
          ) : (
            <button
              type="button"
              onClick={loginGoogle}
              className="text-amber-500 hover:underline font-bold"
            >
              Hubungkan Google
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
