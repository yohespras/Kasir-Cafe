import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Percent, 
  Receipt, 
  CreditCard, 
  HardDrive, 
  Save, 
  CheckCircle2, 
  Wifi, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Cloud, 
  QrCode, 
  DollarSign, 
  Coffee, 
  Image as ImageIcon, 
  Key, 
  User, 
  Check, 
  Printer, 
  ShieldAlert,
  Building,
  Sparkles,
  Eye,
  Type
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { CafeSettings } from '../../types/cafe';

type SettingsTab = 'receipt' | 'profile' | 'tax' | 'payment' | 'system';

const LOGO_PRESETS = [
  {
    name: 'Latte Art Minimalist',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Coffee Bean Roast',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Artisan Espresso',
    url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Vintage Cafe Cup',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=200&q=80'
  }
];

export const SettingsView: React.FC = () => {
  const { 
    cafeSettings, 
    updateCafeSettings, 
    theme, 
    soundEnabled, 
    setSoundEnabled,
    isGoogleAuthenticated,
    googleUser,
    loginGoogle,
    createDriveBackup,
    resetToDemoData
  } = useCafe();

  const isDark = theme === 'dark';
  // Default to 'receipt' so the user immediately sees the requested fields!
  const [activeTab, setActiveTab] = useState<SettingsTab>('receipt');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState<CafeSettings>({ ...cafeSettings });

  const handleFieldChange = <K extends keyof CafeSettings>(key: K, value: CafeSettings[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePaymentToggle = (method: keyof CafeSettings['enabledPayments']) => {
    setFormData(prev => ({
      ...prev,
      enabledPayments: {
        ...prev.enabledPayments,
        [method]: !prev.enabledPayments[method]
      }
    }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Synchronize wifiSsid with receiptWifiUsername and wifiPassword with receiptWifiPassword
    const syncedData: CafeSettings = {
      ...formData,
      wifiSsid: formData.receiptWifiUsername || formData.wifiSsid,
      wifiPassword: formData.receiptWifiPassword || formData.wifiPassword
    };
    updateCafeSettings(syncedData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    setBackupMessage(null);
    try {
      const res = await createDriveBackup();
      setBackupMessage(res.message);
    } catch (err: unknown) {
      setBackupMessage(err instanceof Error ? err.message : 'Gagal mencadangkan data');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Sample receipt preview calculation
  const sampleSubtotal = 78000;
  const sampleTax = formData.taxEnabled ? Math.round(sampleSubtotal * (formData.taxRate / 100)) : 0;
  const sampleService = formData.serviceChargeEnabled ? Math.round(sampleSubtotal * (formData.serviceChargeRate / 100)) : 0;
  const sampleTotal = sampleSubtotal + sampleTax + sampleService;

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }>; highlight?: boolean }[] = [
    { id: 'receipt', label: 'Struk, Logo & Nama', icon: Receipt, highlight: true },
    { id: 'profile', label: 'Profil Kafe', icon: Store },
    { id: 'tax', label: 'Pajak & Biaya', icon: Percent },
    { id: 'payment', label: 'Pembayaran & QRIS', icon: CreditCard },
    { id: 'system', label: 'Sistem & Data', icon: HardDrive }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Pengaturan Sistem Kafe</h1>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Atur nama di struk, logo nota, password & username wifi di struk, pajak, dan profil usaha.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan Tersimpan!</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => handleSave()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className={`rounded-3xl border overflow-hidden transition-all ${
        isDark ? 'bg-stone-900/70 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
      }`}>
        {/* Navigation Tabs Header */}
        <div className={`flex items-center gap-1 p-2 border-b overflow-x-auto ${
          isDark ? 'border-stone-800 bg-stone-950/40' : 'border-stone-200 bg-stone-50'
        }`}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md' 
                    : isDark
                      ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-7">
          {/* TAB 1: STRUK, LOGO, NAMA, PASSWORD & USERNAME DI STRUK */}
          {activeTab === 'receipt' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[10px] font-black uppercase tracking-wider border border-amber-500/25">
                    Kustomisasi Nota Struk
                  </span>
                  <h3 className="text-base font-bold">Pengaturan Nama, Logo, Username & Password di Struk</h3>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Atur semua teks, identitas brand, logo, serta informasi username dan password wifi yang tercetak di kertas struk transaksi.
                </p>
              </div>

              {/* Two Column Layout: Settings Form (Left) & Real-time Live Receipt Preview (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Side: Form Inputs (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Section 1: Nama Kafe di Struk */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                      <Type className="w-4 h-4" />
                      <span>1. Nama Toko / Kafe di Struk</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-stone-300">
                          Nama Kafe di Struk (Judul Utama Huruf Besar) <span className="text-amber-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.receiptCafeName}
                          onChange={e => handleFieldChange('receiptCafeName', e.target.value)}
                          placeholder="misal: KOPI SENJA SPECIALTY"
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold uppercase outline-none ${
                            isDark ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-500'
                          }`}
                        />
                        <p className="text-[10px] text-stone-400 mt-1">
                          Nama ini akan tercetak tebal paling atas pada nota transaksi
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-stone-300">
                          Slogan / Deskripsi Pendek di Bawah Nama
                        </label>
                        <input
                          type="text"
                          value={formData.tagline}
                          onChange={e => handleFieldChange('tagline', e.target.value)}
                          placeholder="Specialty Coffee, Artisan Bakery & Warm Conversations"
                          className={`w-full px-4 py-2 rounded-xl border text-xs outline-none ${
                            isDark ? 'bg-stone-900 border-stone-700 text-stone-200 focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Logo di Struk */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                        <ImageIcon className="w-4 h-4" />
                        <span>2. Logo Kafe di Struk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">Cetak Logo:</span>
                        <button
                          type="button"
                          onClick={() => handleFieldChange('receiptShowLogo', !formData.receiptShowLogo)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            formData.receiptShowLogo ? 'bg-amber-500' : isDark ? 'bg-stone-800' : 'bg-stone-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.receiptShowLogo ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {formData.receiptShowLogo && (
                      <div className="space-y-4 pt-1 animate-in fade-in">
                        {/* Pilihan Tipe Logo */}
                        <div>
                          <label className="block text-xs font-semibold mb-2 text-stone-300">
                            Pilih Bentuk Tampilan Logo di Struk:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { type: 'icon' as const, label: 'Ikon Minimalis', desc: 'Cangkir Kopi POS' },
                              { type: 'monogram' as const, label: 'Monogram', desc: 'Inisial Huruf (KS)' },
                              { type: 'image' as const, label: 'Gambar Logo', desc: 'URL Gambar Kustom' }
                            ].map(item => (
                              <button
                                key={item.type}
                                type="button"
                                onClick={() => handleFieldChange('receiptLogoType', item.type)}
                                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  formData.receiptLogoType === item.type
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold shadow-xs'
                                    : isDark
                                      ? 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                                }`}
                              >
                                <span className="text-xs block">{item.label}</span>
                                <span className="text-[9px] opacity-70 block">{item.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Jika Tipe Logo Gambar */}
                        {formData.receiptLogoType === 'image' && (
                          <div className="space-y-3 pt-2">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-stone-300">
                                Pilih dari Preset Logo Kafe:
                              </label>
                              <div className="grid grid-cols-4 gap-2">
                                {LOGO_PRESETS.map((preset, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleFieldChange('receiptLogoUrl', preset.url)}
                                    className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all cursor-pointer ${
                                      formData.receiptLogoUrl === preset.url
                                        ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                                        : 'border-stone-700 opacity-60 hover:opacity-100'
                                    }`}
                                  >
                                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                                    {formData.receiptLogoUrl === preset.url && (
                                      <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-1 text-stone-300">
                                Atau Masukkan URL Gambar Logo Sendiri:
                              </label>
                              <input
                                type="url"
                                value={formData.receiptLogoUrl || ''}
                                onChange={e => handleFieldChange('receiptLogoUrl', e.target.value)}
                                placeholder="https://example.com/logo-kafe.png"
                                className={`w-full px-4 py-2 rounded-xl border text-xs outline-none ${
                                  isDark ? 'bg-stone-900 border-stone-700 text-stone-200 focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-500'
                                }`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 3: Username & Password di Struk */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                      <Wifi className="w-4 h-4" />
                      <span>3. Username & Password di Struk</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-stone-300">
                          Username Wifi (SSID) di Struk <span className="text-amber-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            value={formData.receiptWifiUsername}
                            onChange={e => handleFieldChange('receiptWifiUsername', e.target.value)}
                            placeholder="KopiSenja_Guest"
                            className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium outline-none ${
                              isDark ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-500'
                            }`}
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">Nama jaringan / akun wifi tamu</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-stone-300">
                          Password Wifi (Sandi) di Struk <span className="text-amber-500">*</span>
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            value={formData.receiptWifiPassword}
                            onChange={e => handleFieldChange('receiptWifiPassword', e.target.value)}
                            placeholder="senjaindah"
                            className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono outline-none ${
                              isDark ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-500'
                            }`}
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">Sandi yang tercetak di bawah nota</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold mb-1 text-stone-300">
                          Label Username Kasir di Struk
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {['Kasir', 'Username Kasir', 'Operator', 'Cashier'].map(label => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => handleFieldChange('receiptCashierPrefix', label)}
                              className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                formData.receiptCashierPrefix === label
                                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                                  : isDark
                                    ? 'bg-stone-900 border-stone-800 text-stone-400'
                                    : 'bg-white border-stone-200 text-stone-700'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">Format penamaan baris kasir pada struk</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Footer Struk & Kertas */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                      <Receipt className="w-4 h-4" />
                      <span>4. Catatan Bawah Nota (Footer)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-stone-300">
                        Pesan Ucapan Terima Kasih
                      </label>
                      <input
                        type="text"
                        value={formData.receiptFooter}
                        onChange={e => handleFieldChange('receiptFooter', e.target.value)}
                        placeholder="TERIMA KASIH ATAS KUNJUNGAN ANDA"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                          isDark ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-500' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Interactive Receipt Mockup (5 cols) */}
                <div className="lg:col-span-5 flex flex-col items-center sticky top-4">
                  <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-amber-500">
                    <Eye className="w-4 h-4" />
                    <span>Pratinjau Kertas Struk Langsung</span>
                  </div>

                  <div className="w-full max-w-[300px] bg-white text-stone-900 p-5 rounded-sm shadow-2xl font-mono text-xs border-t-8 border-amber-600 select-none">
                    {/* Header */}
                    <div className="text-center space-y-1 mb-3">
                      {formData.receiptShowLogo && (
                        <div className="flex justify-center mb-1">
                          {formData.receiptLogoType === 'image' && formData.receiptLogoUrl ? (
                            <img
                              src={formData.receiptLogoUrl}
                              alt="Logo"
                              className="w-12 h-12 rounded-full object-cover border border-stone-300 shadow-xs"
                            />
                          ) : formData.receiptLogoType === 'monogram' ? (
                            <div className="w-10 h-10 bg-stone-900 text-amber-500 rounded-full flex items-center justify-center font-black text-sm tracking-wider">
                              {(formData.receiptCafeName || 'KS').substring(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-stone-900 text-amber-500 rounded-full flex items-center justify-center">
                              <Coffee className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      )}

                      <h4 className="font-black text-sm tracking-wide uppercase leading-tight">
                        {formData.receiptCafeName || 'NAMA KAFE ANDA'}
                      </h4>
                      <p className="text-[9px] text-stone-600 leading-tight">
                        {formData.tagline || 'Specialty Coffee & Eatery'}
                      </p>
                      <p className="text-[8px] text-stone-500 leading-tight">
                        {formData.address || 'Jl. Senopati No. 45, Jakarta'}
                      </p>
                      <p className="text-[8px] text-stone-500 leading-tight">
                        Telp: {formData.phone || '021-789-2041'}
                      </p>
                    </div>

                    <div className="border-t border-dashed border-stone-400 my-2" />

                    {/* Meta */}
                    <div className="space-y-0.5 text-[9px] text-stone-700">
                      <div className="flex justify-between">
                        <span>No. Struk</span>
                        <span className="font-bold text-stone-900">KS-101</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Waktu</span>
                        <span>{new Date().toLocaleDateString('id-ID')} 14:30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-stone-600">{formData.receiptCashierPrefix || 'Kasir'}</span>
                        <span className="font-bold text-stone-900">Sarah Amanda</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pelanggan</span>
                        <span>Bpk. Dimas</span>
                      </div>
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>Layanan</span>
                        <span>MEJA 03</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-stone-400 my-2" />

                    {/* Sample Items */}
                    <div className="space-y-1.5 text-[10px]">
                      <div>
                        <div className="flex justify-between font-bold">
                          <span>1x Kopi Susu Aren Senja</span>
                          <span>Rp 24.000</span>
                        </div>
                        <p className="text-[8px] text-stone-500 pl-2">- Less Sugar 75%, Normal Ice</p>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold">
                          <span>1x Croissant Almond Toast</span>
                          <span>Rp 32.000</span>
                        </div>
                        <p className="text-[8px] text-stone-500 pl-2">- Dihangatkan</p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-stone-400 my-2" />

                    {/* Summary */}
                    <div className="space-y-0.5 text-[9px]">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp 56.000</span>
                      </div>
                      {formData.taxEnabled && (
                        <div className="flex justify-between text-stone-600">
                          <span>PB1 Pajak Resto ({formData.taxRate}%)</span>
                          <span>Rp {Math.round(56000 * (formData.taxRate / 100)).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="border-t border-stone-900 pt-1 flex justify-between font-black text-xs text-stone-950">
                        <span>TOTAL</span>
                        <span>Rp {(56000 + (formData.taxEnabled ? Math.round(56000 * (formData.taxRate / 100)) : 0)).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-stone-600 pt-0.5">
                        <span>Bayar (QRIS / Tunai)</span>
                        <span>Rp {(56000 + (formData.taxEnabled ? Math.round(56000 * (formData.taxRate / 100)) : 0)).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-stone-400 my-2.5" />

                    {/* Barcode & Wifi Credentials Footer */}
                    <div className="text-center space-y-1">
                      <div className="font-mono text-sm tracking-[0.25em] font-black opacity-70">
                        ||||| ||| || ||||
                      </div>
                      {/* Highlighted Wifi Credentials */}
                      <div className="p-1 rounded bg-stone-100 border border-stone-200 text-[8px] text-stone-800">
                        <div>Wifi: <strong>{formData.receiptWifiUsername || 'KopiSenja_Guest'}</strong></div>
                        <div>Pass: <strong>{formData.receiptWifiPassword || 'senjaindah'}</strong></div>
                      </div>
                      <p className="text-[8px] font-bold text-stone-800 uppercase pt-0.5">
                        {formData.receiptFooter || 'TERIMA KASIH ATAS KUNJUNGAN ANDA'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL KAFE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold">Identitas & Informasi Usaha Kafe</h3>
                <p className="text-xs text-stone-400">
                  Data ini akan ditampilkan pada portal pemesanan meja dan laporan keuangan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-stone-300">
                    Nama Usaha Kafe <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cafeName}
                    onChange={e => handleFieldChange('cafeName', e.target.value)}
                    placeholder="misal: Kopi Senja Cafe & Roastery"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-stone-300">
                    Slogan / Tagline Kafe
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={e => handleFieldChange('tagline', e.target.value)}
                    placeholder="misal: Specialty Coffee, Artisan Bakery & Warm Conversations"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-stone-300">
                    Alamat Lengkap Kafe
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={e => handleFieldChange('address', e.target.value)}
                    placeholder="Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-300">
                    Nomor Telepon & WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    placeholder="021-789-2041 / WA 0812-3456-7890"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-300">
                    Email Resmi Usaha
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    placeholder="halo@kopisenja.id"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-stone-300">
                    Jam Operasional Kafe
                  </label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={e => handleFieldChange('openingHours', e.target.value)}
                    placeholder="Setiap Hari: 08:00 - 23:00 WIB"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDark ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100' : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAJAK & BIAYA */}
          {activeTab === 'tax' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold">Pengaturan Pajak Restoran & Biaya Layanan</h3>
                <p className="text-xs text-stone-400">
                  Tentukan persentase Pajak Barang dan Jasa Tertentu (PB1 10%) dan Service Charge untuk setiap transaksi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* PB1 Tax Toggle & Rate */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm">Pajak Restoran (PB1)</span>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('taxEnabled', !formData.taxEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        formData.taxEnabled ? 'bg-amber-500' : isDark ? 'bg-stone-800' : 'bg-stone-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.taxEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 mb-4">
                    Pajak pembangunan 1 yang dipungut atas pelayanan penyediaan makanan dan minuman di kafe.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-300">
                      Tarif Pajak Restoran (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="25"
                        disabled={!formData.taxEnabled}
                        value={formData.taxRate}
                        onChange={e => handleFieldChange('taxRate', Number(e.target.value))}
                        className={`w-28 px-3 py-2 rounded-xl border text-sm font-bold text-center outline-none disabled:opacity-40 ${
                          isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                      <span className="text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Service Charge Toggle & Rate */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm">Biaya Layanan (Service Charge)</span>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('serviceChargeEnabled', !formData.serviceChargeEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        formData.serviceChargeEnabled ? 'bg-amber-500' : isDark ? 'bg-stone-800' : 'bg-stone-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.serviceChargeEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 mb-4">
                    Biaya tambahan pelayanan staf yang dapat diterapkan untuk pesanan dine-in di kafe.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-300">
                      Tarif Biaya Layanan (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        disabled={!formData.serviceChargeEnabled}
                        value={formData.serviceChargeRate}
                        onChange={e => handleFieldChange('serviceChargeRate', Number(e.target.value))}
                        className={`w-28 px-3 py-2 rounded-xl border text-sm font-bold text-center outline-none disabled:opacity-40 ${
                          isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                      <span className="text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Simulation Card */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-stone-950 border-stone-800' : 'bg-amber-50 border-amber-200'
              }`}>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Simulasi Perhitungan Nota (Contoh Subtotal Rp 100.000)
                </span>
                <div className="mt-2 text-xs space-y-1.5">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal Pesanan</span>
                    <span>Rp {sampleSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>PB1 Pajak Resto ({formData.taxEnabled ? `${formData.taxRate}%` : 'Nonaktif'})</span>
                    <span>Rp {sampleTax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Biaya Layanan ({formData.serviceChargeEnabled ? `${formData.serviceChargeRate}%` : 'Nonaktif'})</span>
                    <span>Rp {sampleService.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-stone-700/60 pt-1.5 flex justify-between font-extrabold text-sm text-amber-400">
                    <span>Total Tagihan Pelanggan</span>
                    <span>Rp {sampleTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PEMBAYARAN & QRIS */}
          {activeTab === 'payment' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold">Pengaturan QRIS Merchant & Metode Pembayaran</h3>
                <p className="text-xs text-stone-400">
                  Konfigurasikan identitas QRIS Dinamis dan aktifkan metode pembayaran yang diterima kasir.
                </p>
              </div>

              {/* QRIS Merchant Configuration */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <QrCode className="w-5 h-5" />
                  <span>Konfigurasi QRIS Dinamis Standar Nasional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-300">
                      Nama Merchant QRIS (Tampil di Aplikasi Pelanggan)
                    </label>
                    <input
                      type="text"
                      value={formData.qrisMerchantName}
                      onChange={e => handleFieldChange('qrisMerchantName', e.target.value)}
                      placeholder="KOPI SENJA JAKARTA"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm uppercase outline-none ${
                        isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-300">
                      NMID (Nomor Merchant ID QRIS)
                    </label>
                    <input
                      type="text"
                      value={formData.qrisNmid}
                      onChange={e => handleFieldChange('qrisNmid', e.target.value)}
                      placeholder="ID1020039482910"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono outline-none ${
                        isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-stone-300">
                      Informasi Rekening Bank Transfer
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountInfo}
                      onChange={e => handleFieldChange('bankAccountInfo', e.target.value)}
                      placeholder="BCA 800-123-4567 a.n PT Kopi Senja Indonesia"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Active Payment Methods Toggle */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-stone-400">
                  Metode Pembayaran Kasir yang Diaktifkan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'cash' as const, name: 'Tunai (Cash)', desc: 'Kalkulator uang pas & kembalian', icon: DollarSign },
                    { key: 'qris' as const, name: 'QRIS Dinamis', desc: 'Scan QR GoPay, OVO, BCA, Livin, dll', icon: QrCode },
                    { key: 'edc' as const, name: 'Mesin EDC / Kartu', desc: 'Debit & Kredit Visa / Mastercard', icon: CreditCard },
                    { key: 'transfer' as const, name: 'Transfer Bank Langsung', desc: 'Transfer rekening bank resmi', icon: Building }
                  ].map(m => {
                    const isEnabled = formData.enabledPayments[m.key];
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.key}
                        onClick={() => handlePaymentToggle(m.key)}
                        className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isEnabled
                            ? isDark ? 'bg-amber-500/10 border-amber-500/40 text-stone-100' : 'bg-amber-50 border-amber-300 text-stone-900'
                            : isDark ? 'bg-stone-950/40 border-stone-800 opacity-60' : 'bg-stone-100/60 border-stone-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isEnabled ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs block">{m.name}</span>
                            <span className="text-[10px] text-stone-400">{m.desc}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-500'
                        }`}>
                          {isEnabled ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SISTEM, SUARA & DATA */}
          {activeTab === 'system' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold">Pengaturan Sistem, Efek Suara & Pemulihan Data</h3>
                <p className="text-xs text-stone-400">
                  Kelola audio kasir, integrasi Google Workspace, pencadangan database, dan pemulihan data demo.
                </p>
              </div>

              {/* Sound Effects Toggle */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Efek Suara Terminal Kasir</span>
                    <span className="text-xs text-stone-400">
                      Suara beep barcode saat tambah menu, lonceng pesanan dapur, dan konfirmasi bayar
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    soundEnabled ? 'bg-amber-500' : isDark ? 'bg-stone-800' : 'bg-stone-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Google Workspace Cloud Status */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-sm">Google Workspace Integration</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isGoogleAuthenticated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-400'
                  }`}>
                    {isGoogleAuthenticated ? 'Terkoneksi' : 'Belum Masuk'}
                  </span>
                </div>

                <p className="text-xs text-stone-400">
                  Sinkronisasi pembukuan otomatis ke <strong>Google Sheets</strong> dan pencadangan berkas struk ke <strong>Google Drive</strong>.
                </p>

                {isGoogleAuthenticated ? (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-300 font-medium">
                      Login sebagai: <strong className="text-amber-400">{googleUser?.email}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleBackupNow}
                      disabled={isBackingUp}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isBackingUp ? 'Mencadangkan...' : 'Cadangkan ke Google Drive'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => loginGoogle()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <span>Masuk dengan Google</span>
                  </button>
                )}

                {backupMessage && (
                  <p className="text-xs text-emerald-400 pt-1">{backupMessage}</p>
                )}
              </div>

              {/* Danger Zone: Reset to Demo Data */}
              <div className={`p-5 rounded-2xl border border-rose-900/40 space-y-3 ${
                isDark ? 'bg-rose-950/20' : 'bg-rose-50/70'
              }`}>
                <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Zona Pemulihan & Reset Data Bawaan</span>
                </div>

                <p className={`text-xs ${isDark ? 'text-rose-300/80' : 'text-rose-700'}`}>
                  Jika ingin mengulang demo sistem atau mengembalikan seluruh pengaturan, daftar staf, katalog menu, dan denah meja ke kondisi awal bawaan kafe:
                </p>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={resetToDemoData}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Kembalikan ke Data Demo Awal Kafe</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer save button */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-stone-800 bg-stone-950/40' : 'border-stone-100 bg-stone-50'
        }`}>
          <span className="text-xs text-stone-400">
            Perubahan nama, logo, password dan username struk disimpan secara instan.
          </span>
          <button
            type="button"
            onClick={() => handleSave()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
