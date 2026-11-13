import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Trash2, 
  Edit3, 
  Check, 
  Coffee, 
  ShoppingCart, 
  UtensilsCrossed, 
  Crown, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  Phone, 
  X,
  Sparkles,
  Shield,
  Layers
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { StaffUser, StaffRole } from '../../types/cafe';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
];

export const UsersManagementView: React.FC = () => {
  const { 
    staffUsers, 
    activeStaff, 
    addStaffUser, 
    updateStaffUser, 
    deleteStaffUser, 
    resetStaffPin, 
    loginStaffById,
    theme,
    rolePermissions,
    showConfirmModal
  } = useCafe();

  const isDark = theme === 'dark';

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [pinChangeStaff, setPinChangeStaff] = useState<StaffUser | null>(null);
  const [newPinValue, setNewPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Form state for add / edit
  const [formData, setFormData] = useState<{
    name: string;
    role: StaffRole;
    pin: string;
    avatar: string;
    phone: string;
  }>({
    name: '',
    role: 'kasir',
    pin: '',
    avatar: AVATAR_PRESETS[0],
    phone: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Show/hide PIN toggle map
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  const togglePinReveal = (id: string) => {
    setRevealedPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      role: 'kasir',
      pin: '',
      avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      phone: ''
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (staff: StaffUser) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      pin: staff.pin,
      avatar: staff.avatar,
      phone: staff.phone || ''
    });
    setFormError(null);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nama lengkap staf harus diisi');
      return;
    }
    if (!/^\d{4}$/.test(formData.pin.trim())) {
      setFormError('PIN harus berupa 4 digit angka');
      return;
    }

    const roleLabels: Record<StaffRole, string> = {
      kasir: 'Kasir & Front-of-House',
      barista: 'Head Barista',
      kitchen: 'Kitchen & Dapur',
      manager: 'Manajer & Owner'
    };

    if (editingStaff) {
      updateStaffUser({
        ...editingStaff,
        name: formData.name.trim(),
        role: formData.role,
        roleLabel: roleLabels[formData.role],
        pin: formData.pin.trim(),
        avatar: formData.avatar,
        phone: formData.phone.trim() || undefined
      });
      setEditingStaff(null);
    } else {
      addStaffUser({
        name: formData.name.trim(),
        role: formData.role,
        roleLabel: roleLabels[formData.role],
        pin: formData.pin.trim(),
        avatar: formData.avatar,
        phone: formData.phone.trim() || undefined,
        isActive: true
      });
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteStaff = (staff: StaffUser) => {
    showConfirmModal({
      title: 'Hapus Pengguna Staf?',
      message: `Apakah Anda yakin ingin menghapus akun "${staff.name}" (${staff.roleLabel})? Staf ini tidak akan dapat lagi masuk ke sistem terminal.`,
      confirmLabel: 'Ya, Hapus Staf',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        const res = deleteStaffUser(staff.id);
        if (!res.success) {
          alert(res.message);
        }
      }
    });
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinChangeStaff) return;
    if (!/^\d{4}$/.test(newPinValue.trim())) {
      setPinError('PIN baru harus tepat 4 angka');
      return;
    }
    resetStaffPin(pinChangeStaff.id, newPinValue.trim());
    setPinChangeStaff(null);
    setNewPinValue('');
    setPinError(null);
  };

  // Role counter stats
  const totalStaff = staffUsers.length;
  const kasirCount = staffUsers.filter(u => u.role === 'kasir').length;
  const baristaCount = staffUsers.filter(u => u.role === 'barista').length;
  const kitchenCount = staffUsers.filter(u => u.role === 'kitchen').length;
  const managerCount = staffUsers.filter(u => u.role === 'manager').length;

  const getRoleBadgeStyle = (role: StaffRole) => {
    switch (role) {
      case 'manager':
        return {
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
          icon: Crown,
          dotColor: 'bg-purple-400'
        };
      case 'kasir':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          icon: ShoppingCart,
          dotColor: 'bg-amber-400'
        };
      case 'barista':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
          icon: Coffee,
          dotColor: 'bg-cyan-400'
        };
      case 'kitchen':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: UtensilsCrossed,
          dotColor: 'bg-rose-400'
        };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Kelola Pengguna & Hak Akses Staf</h1>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Atur akun staf, pembagian tugas peran, PIN kasir, dan menu yang dapat diakses setiap peran.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-md shadow-amber-950/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
        }`}>
          <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Total Staf</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black">{totalStaff}</span>
            <span className="text-xs text-stone-400">orang</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Kasir</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-500">{kasirCount}</span>
            <span className="text-xs text-stone-400">akun</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-1.5 text-cyan-500 text-xs font-semibold">
            <Coffee className="w-3.5 h-3.5" />
            <span>Barista</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-cyan-500">{baristaCount}</span>
            <span className="text-xs text-stone-400">akun</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Kitchen</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-500">{kitchenCount}</span>
            <span className="text-xs text-stone-400">akun</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all col-span-2 sm:col-span-1 ${
          isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>Manajer</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-400">{managerCount}</span>
            <span className="text-xs text-stone-400">akun</span>
          </div>
        </div>
      </div>

      {/* Role Duties & Allowed Menus Explanation Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        isDark ? 'bg-stone-900/40 border-stone-800' : 'bg-amber-50/60 border-amber-200/70'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 flex-shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>Aturan Hak Akses Berdasarkan Tugas Peran (RBAC)</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                  Otomatis Aktif
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Setiap staf yang masuk ke terminal POS hanya dapat melihat dan menggunakan menu yang sesuai dengan peran tugasnya:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className={`p-3 rounded-2xl border ${
                isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-amber-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-amber-500 mb-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Kasir (Front-of-House)</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Akses: <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>Kasir POS</strong>, <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>Meja Kafe</strong>, Buka/Tutup Shift Laci, Bayar Tunai & QRIS.
                </p>
              </div>

              <div className={`p-3 rounded-2xl border ${
                isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-amber-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Barista (Station Bar)</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Akses: <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>KDS Antrean Minuman</strong>, <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>Cek Menu & Stok</strong> (status habis/tersedia).
                </p>
              </div>

              <div className={`p-3 rounded-2xl border ${
                isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-amber-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Kitchen (Dapur & Koki)</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Akses: <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>KDS Antrean Makanan</strong>, <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>Cek Menu & Stok</strong> bahan masakan.
                </p>
              </div>

              <div className={`p-3 rounded-2xl border ${
                isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-amber-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-purple-400 mb-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Manajer & Owner</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Akses: <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>Akses Penuh Seluruh Menu</strong> (Laporan Laba, User, Pengaturan, Google Sync, POS).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2">
            <span>Daftar Akun Staf Aktif</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full ${
              isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
            }`}>
              {staffUsers.length}
            </span>
          </h2>
          <span className="text-xs text-stone-400">Klik "Simulasi Login" untuk langsung melihat tampilan peran</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {staffUsers.map(staff => {
            const roleStyle = getRoleBadgeStyle(staff.role);
            const RoleIcon = roleStyle.icon;
            const isCurrentActive = activeStaff?.id === staff.id;
            const isRevealed = !!revealedPins[staff.id];
            const allowedTabs = rolePermissions[staff.role]?.allowedTabs || [];

            return (
              <div 
                key={staff.id}
                className={`relative rounded-3xl p-5 border transition-all ${
                  isCurrentActive 
                    ? isDark 
                      ? 'bg-amber-950/20 border-amber-500/50 ring-2 ring-amber-500/20' 
                      : 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                    : isDark 
                      ? 'bg-stone-900/70 border-stone-800 hover:border-stone-700' 
                      : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                {/* Active Indicator Ribbon */}
                {isCurrentActive && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-[11px] font-black tracking-wide shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>SEDANG LOGIN</span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img 
                      src={staff.avatar} 
                      alt={staff.name} 
                      className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-stone-700/50" 
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg ${roleStyle.bg} border flex items-center justify-center`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="flex-1 min-w-0 pr-12">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black truncate">{staff.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${roleStyle.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dotColor}`} />
                        {staff.roleLabel}
                      </span>
                      {staff.phone && (
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {staff.phone}
                        </span>
                      )}
                    </div>

                    {/* PIN Security Field */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border ${
                        isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-100 border-stone-200'
                      }`}>
                        <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                        <span className="text-stone-400">PIN:</span>
                        <span className="font-bold tracking-widest text-sm">
                          {isRevealed ? staff.pin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinReveal(staff.id)}
                          className="text-stone-400 hover:text-amber-500 p-0.5 transition-colors cursor-pointer ml-1"
                          title={isRevealed ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPinChangeStaff(staff);
                          setNewPinValue('');
                          setPinError(null);
                        }}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                          isDark ? 'text-amber-400 hover:bg-stone-800' : 'text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        Ubah PIN
                      </button>
                    </div>
                  </div>
                </div>

                {/* Duty description & Menu tabs list */}
                <div className={`mt-4 pt-3.5 border-t text-xs space-y-1.5 ${
                  isDark ? 'border-stone-800 text-stone-400' : 'border-stone-100 text-stone-600'
                }`}>
                  <p className="line-clamp-2">
                    {rolePermissions[staff.role]?.dutyDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[11px] font-semibold text-stone-400">Akses Menu:</span>
                    {allowedTabs.map(tab => (
                      <span 
                        key={tab} 
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                          isDark 
                            ? 'bg-stone-800/80 border-stone-700 text-stone-300' 
                            : 'bg-stone-100 border-stone-300 text-stone-700'
                        }`}
                      >
                        {tab === 'pos' ? 'Kasir POS' :
                         tab === 'tables' ? 'Meja Kafe' :
                         tab === 'kds' ? 'Dapur/KDS' :
                         tab === 'menu' ? 'Menu & Stok' :
                         tab === 'reports' ? 'Laporan' :
                         tab === 'users' ? 'Kelola User' :
                         tab === 'settings' ? 'Pengaturan' :
                         tab === 'google' ? 'Google Sync' : 'Self-Order'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
                  isDark ? 'border-stone-800' : 'border-stone-100'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(staff)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200' 
                          : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profil</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(staff)}
                      disabled={isCurrentActive}
                      title={isCurrentActive ? 'Tidak bisa menghapus akun yang sedang aktif' : 'Hapus akun staf'}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isDark 
                          ? 'border-rose-900/40 text-rose-400 hover:bg-rose-950/40' 
                          : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>

                  {!isCurrentActive ? (
                    <button
                      type="button"
                      onClick={() => loginStaffById(staff.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Simulasi Login</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Akun Aktif
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Tambah & Edit Staf */}
      {(isAddModalOpen || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 overflow-hidden ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  {editingStaff ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingStaff ? 'Edit Profil Staf' : 'Tambah Pengguna Staf Baru'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {editingStaff ? 'Perbarui data staf dan peran tugas' : 'Buat akun staf baru untuk akses terminal'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStaff(null);
                }}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStaff} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-300">
                  Nama Lengkap Staf <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Sarah Amanda"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    isDark 
                      ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' 
                      : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-300">
                  Peran & Hak Akses Tugas <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'kasir' as StaffRole, title: 'Kasir', desc: 'POS, Meja, Shift', icon: ShoppingCart, color: 'text-amber-400' },
                    { role: 'barista' as StaffRole, title: 'Barista', desc: 'KDS Minuman, Stok', icon: Coffee, color: 'text-cyan-400' },
                    { role: 'kitchen' as StaffRole, title: 'Kitchen / Dapur', desc: 'KDS Makanan, Stok', icon: UtensilsCrossed, color: 'text-rose-400' },
                    { role: 'manager' as StaffRole, title: 'Manajer / Owner', desc: 'Akses Penuh', icon: Crown, color: 'text-purple-400' }
                  ].map(item => {
                    const isSelected = formData.role === item.role;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: item.role })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? isDark 
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-xs' 
                              : 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                            : isDark
                              ? 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-400'
                              : 'bg-stone-50 border-stone-200 hover:border-stone-300 text-stone-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                          <span>{item.title}</span>
                        </div>
                        <p className="text-[10px] opacity-80">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-300">
                    PIN Masuk Terminal (4 Angka) <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="misal: 1234"
                    value={formData.pin}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, pin: val });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono tracking-widest text-center outline-none transition-all ${
                      isDark 
                        ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' 
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                    }`}
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Digunakan untuk login cepat di layar kasir</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-300">
                    Nomor WhatsApp / Kontak (Opsional)
                  </label>
                  <input
                    type="tel"
                    placeholder="misal: 0812-3456-7890"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' 
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              {/* Avatar Preset Picker */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-stone-300">
                  Pilih Foto Profil Staf
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: url })}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        formData.avatar === url 
                          ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105' 
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                      {formData.avatar === url && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-amber-400 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {editingStaff ? 'Simpan Perubahan' : 'Tambah Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ganti PIN Cepat */}
      {pinChangeStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Ubah PIN Masuk</h3>
                  <p className="text-xs text-stone-400">{pinChangeStaff.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPinChangeStaff(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pinError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                {pinError}
              </div>
            )}

            <form onSubmit={handleSavePin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-300">
                  Masukkan PIN Baru (4 Angka)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  required
                  placeholder="••••"
                  value={newPinValue}
                  onChange={e => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-4 py-3 rounded-xl border text-xl font-mono tracking-widest text-center outline-none ${
                    isDark 
                      ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' 
                      : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinChangeStaff(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md"
                >
                  Simpan PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
