import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Clock, 
  Volume2, 
  VolumeX, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useCafe } from '../context/CafeContext';
import { ShiftModal } from './modals/ShiftModal';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    activeStaff,
    logoutStaff,
    currentShift,
    isGoogleAuthenticated,
    googleUser,
    loginGoogle,
    logoutGoogle,
    setMobileSidebarOpen
  } = useCafe();

  const [currentTime, setCurrentTime] = useState('');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'pos': return 'Kasir POS Terminal';
      case 'tables': return 'Peta Meja & Dine-in';
      case 'kds': return 'Kitchen Display System (KDS)';
      case 'menu': return 'Katalog Menu & Manajemen Stok';
      case 'reports': return 'Laporan Penjualan & Analitik';
      case 'users': return 'Kelola Pengguna & Hak Akses Staf';
      case 'settings': return 'Pengaturan Sistem Kafe';
      case 'google': return 'Sinkronisasi Google Workspace';
      case 'selforder': return 'Simulasi QR Menu Pelanggan';
      default: return 'Kasir POS';
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      <header className={`h-16 px-4 sm:px-6 flex items-center justify-between border-b transition-colors select-none ${
        isDark 
          ? 'bg-stone-950/95 border-stone-850 text-stone-100' 
          : 'bg-white/95 border-stone-200 text-stone-800'
      }`}>
        {/* Left: Mobile Sidebar Hamburger & Current Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className={`p-2 rounded-xl border lg:hidden ${
              isDark ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-stone-100 border-stone-300 text-stone-700'
            }`}
            title="Buka Side Bar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight">
              {getPageTitle()}
            </h1>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Kopi Senja • Specialty Coffee POS
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Clock */}
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-stone-100 border-stone-200 text-stone-700'
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentTime} WIB</span>
          </div>

          {/* Shift indicator button */}
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isDark ? 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300' : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${currentShift.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>Shift: <strong className="text-amber-500">{currentShift.cashierName}</strong></span>
          </button>

          {/* GELAP / TERANG THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isDark
                ? 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-amber-400'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800 shadow-sm'
            }`}
            title={isDark ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Gelap</span>
              </>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white' : 'bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
            title={soundEnabled ? 'Matikan Suara Beep' : 'Aktifkan Suara Beep'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Staff User Quick Lock / Logout */}
          {activeStaff && (
            <button
              onClick={logoutStaff}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-stone-900 hover:bg-rose-950/30 border-stone-800 text-stone-300 hover:text-rose-400' 
                  : 'bg-stone-100 hover:bg-rose-50 border-stone-200 text-stone-700 hover:text-rose-600'
              }`}
              title="Kunci Layar Kasir / Logout"
            >
              <img
                src={activeStaff.avatar}
                alt={activeStaff.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="hidden xl:inline">{activeStaff.name}</span>
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded hidden sm:inline ${
                activeStaff.role === 'manager' ? 'bg-purple-500/20 text-purple-400' :
                activeStaff.role === 'kasir' ? 'bg-amber-500/20 text-amber-400' :
                activeStaff.role === 'barista' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {activeStaff.role}
              </span>
              <LogOut className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {/* Google Account Profile Button */}
          {isGoogleAuthenticated && googleUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-2 px-2 py-1 rounded-xl border ${
                  isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-100 border-stone-200'
                }`}
              >
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google'}
                    className="w-6 h-6 rounded-full border border-amber-500/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center">
                    G
                  </div>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>

              {isProfileMenuOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in ${
                  isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
                }`}>
                  <p className="font-bold truncate">{googleUser.displayName}</p>
                  <p className="text-[11px] text-stone-400 truncate">{googleUser.email}</p>
                  <button
                    onClick={() => {
                      logoutGoogle();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    Putuskan Akun Google
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={loginGoogle}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isDark ? 'bg-white text-stone-950 hover:bg-stone-100' : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
              title="Hubungkan Google Drive & Sheets"
            >
              <div className="w-3.5 h-3.5">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span className="hidden md:inline">Google</span>
            </button>
          )}
        </div>
      </header>

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />
    </>
  );
};
