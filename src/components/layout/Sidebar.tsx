import React, { useState } from 'react';
import { 
  Coffee, 
  ShoppingCart, 
  LayoutGrid, 
  UtensilsCrossed, 
  MenuSquare, 
  BarChart3, 
  Cloud, 
  QrCode, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Clock, 
  X,
  CreditCard,
  Banknote,
  ShieldCheck,
  Sparkles,
  Users,
  Settings,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useCafe, ActiveTab } from '../../context/CafeContext';

interface SidebarProps {
  onOpenShiftModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenShiftModal }) => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    activeStaff,
    logoutStaff,
    currentShift,
    orders,
    tables,
    cart,
    menuItems,
    isGoogleAuthenticated,
    googleUser,
    loginGoogle,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    staffUsers,
    loginStaffById,
    hasTabPermission,
    rolePermissions
  } = useCafe();

  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const pendingKitchenCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const occupiedTablesCount = tables.filter(t => t.status === 'occupied').length;
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = menuItems.filter(m => m.stock > 0 && m.stock <= 5).length;

  const allNavItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { 
      id: 'pos', 
      label: 'Kasir POS', 
      icon: ShoppingCart, 
      badge: cartItemsCount > 0 ? cartItemsCount : undefined,
      badgeColor: 'bg-amber-500 text-stone-950'
    },
    { 
      id: 'tables', 
      label: 'Meja Kafe', 
      icon: LayoutGrid, 
      badge: occupiedTablesCount > 0 ? occupiedTablesCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    { 
      id: 'kds', 
      label: 'Dapur & Barista', 
      icon: UtensilsCrossed, 
      badge: pendingKitchenCount > 0 ? pendingKitchenCount : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    { 
      id: 'menu', 
      label: 'Menu & Stok', 
      icon: MenuSquare, 
      badge: lowStockCount > 0 ? `${lowStockCount} tipis` : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-400'
    },
    { 
      id: 'reports', 
      label: 'Laporan & Omset', 
      icon: BarChart3 
    },
    { 
      id: 'users', 
      label: 'Kelola User', 
      icon: Users,
      badge: `${staffUsers.length} staf`,
      badgeColor: 'bg-purple-500/20 text-purple-300'
    },
    { 
      id: 'settings', 
      label: 'Pengaturan', 
      icon: Settings 
    },
    { 
      id: 'google', 
      label: 'Google Sync', 
      icon: Cloud, 
      badge: isGoogleAuthenticated ? 'Aktif' : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400'
    },
    { 
      id: 'selforder', 
      label: 'QR Pelanggan', 
      icon: QrCode 
    }
  ];

  // Strictly filter navigation items to only those permitted for the active staff's role
  const visibleNavItems = allNavItems.filter(item => hasTabPermission(item.id));

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen transition-all duration-300 flex flex-col justify-between select-none ${
          /* Responsive widths */
          isSidebarCollapsed ? 'w-20' : 'w-64 sm:w-72'
        } ${
          /* Mobile slide-in positioning */
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Dark / Light styling */
          theme === 'dark'
            ? 'bg-stone-950 border-r border-stone-850 text-stone-100'
            : 'bg-white border-r border-stone-200 text-stone-800 shadow-sm'
        }`}
      >
        {/* Top: Brand Header & Collapse Toggle (Fixed Top) */}
        <div className={`p-4 flex items-center justify-between border-b flex-shrink-0 ${
          theme === 'dark' ? 'border-stone-850' : 'border-stone-100'
        }`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md shadow-amber-950/30 flex-shrink-0">
                <Coffee className="w-6 h-6 stroke-[2.5]" />
              </div>

              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-black text-sm tracking-tight text-amber-500 truncate">
                      KOPI SENJA
                    </h2>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      POS
                    </span>
                  </div>
                  <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                    Specialty Coffee & Eatery
                  </p>
                </div>
              )}
            </div>

            {/* Collapse toggle (Desktop) / Close (Mobile) */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className={`p-1.5 rounded-lg lg:hidden ${
                  theme === 'dark' ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <button
                onClick={toggleSidebar}
                className={`p-1.5 rounded-xl hidden lg:flex items-center justify-center transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-stone-850 text-stone-400 hover:text-stone-200'
                    : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
                }`}
                title={isSidebarCollapsed ? 'Perluas Side Bar' : 'Ciutkan Side Bar'}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Middle Scrollable Section: Staff Profile, Shift Card & Navigation (With Visible Scrollbar) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-2 sidebar-scrollbar space-y-1">
            {/* Active Staff Profile Card with Role Switcher */}
          {activeStaff && (
            <div className={`p-3 mx-3 my-3 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-stone-900/80 border-stone-800'
                : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={activeStaff.avatar}
                    alt={activeStaff.name}
                    className="w-9 h-9 rounded-xl object-cover border border-amber-500/40 flex-shrink-0"
                  />
                  {!isSidebarCollapsed && (
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${
                        theme === 'dark' ? 'text-stone-100' : 'text-stone-900'
                      }`}>
                        {activeStaff.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 transition-all cursor-pointer ${
                          activeStaff.role === 'manager'
                            ? 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/25'
                            : activeStaff.role === 'kasir'
                            ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                            : activeStaff.role === 'barista'
                            ? 'bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25'
                            : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                        }`}
                        title="Klik untuk ganti peran staf"
                      >
                        <span className="uppercase">{activeStaff.role}</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <button
                    onClick={logoutStaff}
                    className={`p-1.5 rounded-lg text-xs transition-colors flex-shrink-0 cursor-pointer ${
                      theme === 'dark'
                        ? 'text-stone-400 hover:text-rose-400 hover:bg-stone-800'
                        : 'text-stone-500 hover:text-rose-600 hover:bg-stone-200'
                    }`}
                    title="Kunci Kasir / Ganti Staf (Logout)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Role Switcher Dropdown */}
              {isRoleSwitcherOpen && !isSidebarCollapsed && (
                <div className={`mt-3 pt-2.5 border-t space-y-1 animate-in fade-in ${
                  theme === 'dark' ? 'border-stone-800' : 'border-stone-200'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-1 mb-1">
                    Ubah Peran Tugas:
                  </span>
                  {staffUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        loginStaffById(u.id);
                        setIsRoleSwitcherOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-1.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                        u.id === activeStaff.id
                          ? 'bg-amber-500/20 text-amber-400 font-bold'
                          : theme === 'dark' ? 'hover:bg-stone-800 text-stone-300' : 'hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-md object-cover flex-shrink-0" />
                        <span className="truncate text-[11px]">{u.name}</span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        u.role === 'manager' ? 'text-purple-400 bg-purple-500/10' :
                        u.role === 'kasir' ? 'text-amber-400 bg-amber-500/10' :
                        u.role === 'barista' ? 'text-cyan-400 bg-cyan-500/10' :
                        'text-rose-400 bg-rose-500/10'
                      }`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shift Status Quick Action (Shown for Kasir & Manager) */}
          {!isSidebarCollapsed && rolePermissions[activeStaff?.role || 'kasir']?.canManageShifts && (
            <div className="px-3 mb-2">
              <button
                onClick={onOpenShiftModal}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-stone-900/50 border-stone-850 hover:bg-stone-900 text-stone-300'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    currentShift.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`} />
                  <span className="font-semibold truncate">
                    Shift {currentShift.isOpen ? 'Aktif' : 'Tutup'}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-500">
                  Rp {(currentShift.openingCash + currentShift.totalRevenue).toLocaleString('id-ID')}
                </span>
              </button>
            </div>
          )}

          {/* Navigation Items List (Filtered strictly by role) */}
          <nav className="px-3 space-y-1 mt-2">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs sm:text-sm font-bold transition-all relative ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/20'
                      : theme === 'dark'
                      ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-900'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-stone-950' : 'text-stone-400'
                    }`} />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      isSidebarCollapsed ? 'absolute -top-1 -right-1' : ''
                    } ${
                      isActive
                        ? 'bg-stone-950 text-amber-400'
                        : item.badgeColor || 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utilities (Fixed Bottom): Theme (Gelap/Terang), Audio, Google Account */}
        <div className={`p-3 space-y-2 border-t flex-shrink-0 ${
          theme === 'dark' ? 'border-stone-850' : 'border-stone-100'
        }`}>
          {/* Theme Toggle (Gelap / Terang) */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'bg-stone-900 border-stone-800 text-amber-400 hover:bg-stone-850'
                : 'bg-stone-100 border-stone-200 text-stone-800 hover:bg-stone-200'
            }`}
            title="Ganti Tema Gelap / Terang"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              )}
              {!isSidebarCollapsed && (
                <span className="truncate">
                  {theme === 'dark' ? 'Mode Gelap (Aktif)' : 'Mode Terang (Aktif)'}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                theme === 'dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {theme === 'dark' ? 'GELAP' : 'TERANG'}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-500 flex-shrink-0" />
              )}
              {!isSidebarCollapsed && (
                <span className="truncate">Suara Beep Kasir</span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-bold opacity-75">
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            )}
          </button>

          {/* Google Workspace status indicator */}
          {!isSidebarCollapsed && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
              theme === 'dark' ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2 h-2 rounded-full ${
                  isGoogleAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className="truncate text-[11px] text-stone-400">
                  {isGoogleAuthenticated ? 'Drive & Sheets Terhubung' : 'Google Workspace'}
                </span>
              </div>
              {!isGoogleAuthenticated && (
                <button
                  onClick={loginGoogle}
                  className="text-amber-500 hover:underline text-[11px] font-bold ml-1 flex-shrink-0"
                >
                  Hubungkan
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
