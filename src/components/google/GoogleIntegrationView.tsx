import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  HardDrive, 
  CloudCheck, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  FileText, 
  Database 
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';

export const GoogleIntegrationView: React.FC = () => {
  const {
    googleUser,
    isGoogleAuthenticated,
    isAuthLoading,
    loginGoogle,
    logoutGoogle,
    sheetsConfig,
    updateSheetsConfig,
    connectGoogleSheet,
    syncAllToGoogleSheets,
    driveFiles,
    isLoadingDrive,
    refreshDriveFiles,
    createDriveBackup,
    deleteDriveItem,
    theme
  } = useCafe();

  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isBackingUpDrive, setIsBackingUpDrive] = useState(false);
  const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null);

  const isDark = theme === 'dark';

  const showNotification = (text: string, isError = false) => {
    setNotification({ text, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSyncSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const res = await syncAllToGoogleSheets();
      showNotification(res.message, !res.success);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal sinkron ke Google Sheets';
      showNotification(message, true);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleCreateNewSheet = async () => {
    setIsSyncingSheets(true);
    try {
      await connectGoogleSheet();
      showNotification('Spreadsheet baru berhasil dibuat dan dihubungkan ke sistem!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat spreadsheet baru';
      showNotification(message, true);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleBackupNow = async () => {
    setIsBackingUpDrive(true);
    try {
      const res = await createDriveBackup();
      showNotification(res.message, !res.success);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat backup di Drive';
      showNotification(message, true);
    } finally {
      setIsBackingUpDrive(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f2] text-stone-900'
    }`}>
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
        isDark ? 'border-stone-850' : 'border-stone-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <HardDrive className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black">Integrasi Google Workspace</h2>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Sinkronisasi otomatis pembukuan penjualan di Google Sheets dan arsip struk / backup data di Google Drive
          </p>
        </div>

        {/* Auth status summary badge */}
        <div className="flex items-center gap-2">
          {isGoogleAuthenticated ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" /> Google Akun Terhubung
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
              <AlertCircle className="w-4 h-4" /> Belum Masuk Google
            </span>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border transition-all ${
          notification.isError
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
        }`}>
          {notification.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {/* Account Profile Card */}
      <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          {googleUser?.photoURL ? (
            <img
              src={googleUser.photoURL}
              alt={googleUser.displayName || 'Google Profile'}
              className="w-14 h-14 rounded-2xl border-2 border-amber-500/40"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-black text-xl">
              {googleUser?.displayName?.[0] || 'G'}
            </div>
          )}

          <div>
            <h3 className="text-base font-bold">
              {googleUser?.displayName || 'Tamu / Akun Google Belum Masuk'}
            </h3>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              {googleUser?.email || 'Login untuk mengaktifkan sinkronisasi cloud Google'}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] opacity-75">
              <span className="flex items-center gap-1 text-emerald-500 font-bold">
                <FileSpreadsheet className="w-3 h-3" /> Google Sheets API
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-500 font-bold">
                <HardDrive className="w-3 h-3" /> Google Drive API
              </span>
            </div>
          </div>
        </div>

        <div>
          {isGoogleAuthenticated ? (
            <button
              onClick={logoutGoogle}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isDark ? 'bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              Putuskan Sambungan
            </button>
          ) : (
            <button
              onClick={loginGoogle}
              disabled={isAuthLoading}
              className="px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 border border-stone-300"
            >
              <div className="w-4 h-4">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span>Hubungkan Akun Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Google Sheets & Google Drive Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Sheets Panel */}
        <div className={`p-6 rounded-3xl border space-y-5 flex flex-col justify-between ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Google Sheets Pembukuan</h3>
                  <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Pencatatan kasir dan laporan keuangan langsung</p>
                </div>
              </div>
            </div>

            {/* Connected Spreadsheet Box */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Spreadsheet Aktif:</span>
                <span className="font-bold text-emerald-500">
                  {sheetsConfig.spreadsheetId ? 'Terhubung' : 'Belum Dibuat'}
                </span>
              </div>

              <p className="text-sm font-bold">
                {sheetsConfig.spreadsheetTitle}
              </p>

              {sheetsConfig.lastSyncedAt && (
                <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  Terakhir sinkron: {new Date(sheetsConfig.lastSyncedAt).toLocaleString('id-ID')}
                </p>
              )}

              {sheetsConfig.spreadsheetUrl && (
                <a
                  href={sheetsConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline pt-1"
                >
                  <span>Buka Lembar Kerja di Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Structure info */}
            <div className={`p-3 rounded-xl space-y-1.5 text-xs border ${
              isDark ? 'bg-stone-950/60 border-stone-800/60' : 'bg-stone-50 border-stone-200'
            }`}>
              <p className="font-bold">Tiga Lembar Data Otomatis Dibuat:</p>
              <ul className={`list-disc list-inside space-y-0.5 text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                <li><strong>Transaksi_Kasir:</strong> Rincian item, nomor struk, kasir, total, dan PB1</li>
                <li><strong>Menu_Dan_Stok:</strong> Daftar harga, modal HPP, margin laba, dan stok</li>
                <li><strong>Ringkasan_Penjualan:</strong> Rekap harian omset dan estimasi laba</li>
              </ul>
            </div>

            {/* Auto-Sync Toggle */}
            <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer ${
              isDark ? 'bg-stone-950/40 border-stone-850' : 'bg-stone-50 border-stone-200'
            }`}>
              <div>
                <p className="text-xs font-bold">Otomatis Sinkron Transaksi Baru</p>
                <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Tiap ada pembayaran selesai, langsung tambahkan baris di Sheets</p>
              </div>
              <input
                type="checkbox"
                checked={sheetsConfig.autoSync}
                onChange={e => updateSheetsConfig({ autoSync: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Sheets Action Buttons */}
          <div className={`flex gap-2.5 pt-4 border-t ${
            isDark ? 'border-stone-850' : 'border-stone-100'
          }`}>
            <button
              onClick={handleSyncSheets}
              disabled={isSyncingSheets || !isGoogleAuthenticated}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheets ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>

            <button
              onClick={handleCreateNewSheet}
              disabled={isSyncingSheets || !isGoogleAuthenticated}
              className={`py-2.5 px-4 font-bold rounded-xl text-xs border transition-colors disabled:opacity-40 ${
                isDark ? 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
              }`}
            >
              Buat Ulang Sheet
            </button>
          </div>
        </div>

        {/* Google Drive Panel */}
        <div className={`p-6 rounded-3xl border space-y-5 flex flex-col justify-between ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Google Drive Arsip & Cadangan</h3>
                  <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Penyimpanan struk digital & cadangan data POS</p>
                </div>
              </div>

              <button
                onClick={refreshDriveFiles}
                disabled={isLoadingDrive || !isGoogleAuthenticated}
                className={`p-2 rounded-xl border disabled:opacity-40 ${
                  isDark ? 'text-stone-400 hover:text-white bg-stone-950 border-stone-800' : 'text-stone-600 hover:text-stone-900 bg-stone-100 border-stone-200'
                }`}
                title="Muat Ulang Berkas"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDrive ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Drive Files List */}
            <div className="space-y-2">
              <div className={`flex justify-between items-center text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                <span>Berkas di Google Drive Anda ({driveFiles.length} berkas)</span>
                <span className="text-[11px] opacity-75">Kopi_Senja_*</span>
              </div>

              <div className={`max-h-60 overflow-y-auto space-y-2 p-2 rounded-2xl border ${
                isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
              }`}>
                {driveFiles.length === 0 ? (
                  <div className={`p-6 text-center text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    {isGoogleAuthenticated ? (
                      <p>Belum ada berkas backup atau struk yang diunggah ke Google Drive.</p>
                    ) : (
                      <p>Silakan masuk dengan akun Google untuk melihat dan mengunggah berkas ke Google Drive.</p>
                    )}
                  </div>
                ) : (
                  driveFiles.map(file => (
                    <div
                      key={file.id}
                      className={`p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs border transition-colors ${
                        isDark ? 'bg-stone-900 border-stone-800 hover:border-stone-700' : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {file.type === 'backup_json' ? (
                          <Database className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate">{file.name}</p>
                          <p className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                            {new Date(file.createdTime).toLocaleString('id-ID')} • {file.size || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1.5 rounded-lg ${
                              isDark ? 'text-stone-400 hover:text-amber-400 hover:bg-stone-800' : 'text-stone-500 hover:text-amber-600 hover:bg-stone-100'
                            }`}
                            title="Buka di Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => deleteDriveItem(file.id, file.name)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10"
                          title="Hapus Berkas dari Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Drive Action Button */}
          <div className={`pt-4 border-t ${isDark ? 'border-stone-850' : 'border-stone-100'}`}>
            <button
              onClick={handleBackupNow}
              disabled={isBackingUpDrive || !isGoogleAuthenticated}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <HardDrive className={`w-3.5 h-3.5 ${isBackingUpDrive ? 'animate-bounce' : ''}`} />
              <span>{isBackingUpDrive ? 'Menyimpan ke Drive...' : 'Buat File Cadangan Penuh ke Google Drive (JSON)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
