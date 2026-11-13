import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Calendar, 
  CloudUpload, 
  FileSpreadsheet, 
  HardDrive, 
  ArrowUpRight, 
  CreditCard,
  Banknote,
  QrCode,
  Search,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Order } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';

export const ReportsView: React.FC = () => {
  const { 
    orders, 
    menuItems, 
    setActiveReceiptOrder, 
    syncAllToGoogleSheets, 
    createDriveBackup, 
    isGoogleAuthenticated,
    sheetsConfig,
    loginGoogle,
    theme
  } = useCafe();

  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'all'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const isDark = theme === 'dark';

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter(o => {
      const orderTime = new Date(o.timestamp).getTime();
      let matchTime = true;
      if (timeRange === 'today') {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        matchTime = orderTime >= todayStart;
      } else if (timeRange === '7days') {
        matchTime = orderTime >= now - 7 * 86400000;
      }

      const matchPay = paymentFilter === 'all' || o.paymentMethod === paymentFilter;
      const matchSearch = 
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.tableNumber && o.tableNumber.includes(searchTerm));

      return matchTime && matchPay && matchSearch;
    });
  }, [orders, timeRange, paymentFilter, searchTerm]);

  // Financial aggregates
  const completedOrders = filteredOrders.filter(o => o.status === 'completed' || o.status === 'ready' || o.status === 'preparing');
  const grossRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalDiscounts = completedOrders.reduce((sum, o) => sum + o.discount, 0);
  const netRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const aov = completedOrders.length > 0 ? Math.round(netRevenue / completedOrders.length) : 0;

  // Approximate COGS & Gross Profit
  let totalCOGS = 0;
  completedOrders.forEach(o => {
    o.items.forEach(item => {
      const original = menuItems.find(m => m.id === item.menuItem.id);
      if (original) {
        totalCOGS += original.costPrice * item.quantity;
      }
    });
  });
  const grossProfit = netRevenue - totalCOGS;

  // Payment Breakdown
  const paymentBreakdown = {
    cash: completedOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0),
    qris: completedOrders.filter(o => o.paymentMethod === 'qris').reduce((sum, o) => sum + o.totalAmount, 0),
    debit: completedOrders.filter(o => o.paymentMethod === 'debit' || o.paymentMethod === 'transfer').reduce((sum, o) => sum + o.totalAmount, 0)
  };

  // Top Selling Items in Range
  const itemSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  completedOrders.forEach(o => {
    o.items.forEach(i => {
      if (!itemSalesMap[i.menuItem.id]) {
        itemSalesMap[i.menuItem.id] = { name: i.menuItem.name, qty: 0, revenue: 0 };
      }
      itemSalesMap[i.menuItem.id].qty += i.quantity;
      itemSalesMap[i.menuItem.id].revenue += i.totalPrice;
    });
  });

  const topItems = Object.values(itemSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const handleSyncSheets = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      if (!isGoogleAuthenticated) {
        await loginGoogle();
      }
      const res = await syncAllToGoogleSheets();
      setSyncStatusMsg(res.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal sinkron';
      setSyncStatusMsg(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackupDrive = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      if (!isGoogleAuthenticated) {
        await loginGoogle();
      }
      const res = await createDriveBackup();
      setSyncStatusMsg(res.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal backup';
      setSyncStatusMsg(message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f2] text-stone-900'
    }`}>
      {/* Top Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Laporan Penjualan & Analitik Kafe</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Ringkasan omset kasir, performa menu terlaris, dan pembukuan Google Sheets
          </p>
        </div>

        {/* Sync & Export CTA buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncSheets}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
            title="Kirim dan sinkronkan data penjualan ke Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron ke Google Sheets'}</span>
          </button>

          <button
            onClick={handleBackupDrive}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-3.5 py-2 font-bold rounded-xl text-xs border transition-all disabled:opacity-50 ${
              isDark ? 'bg-stone-900 hover:bg-stone-850 text-stone-200 border-stone-800' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300 shadow-sm'
            }`}
            title="Simpan backup lengkap ke Google Drive"
          >
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span>Cadangkan ke Drive</span>
          </button>
        </div>
      </div>

      {/* Sync Status Feedback Toast */}
      {syncStatusMsg && (
        <div className={`p-3 rounded-2xl text-xs flex items-center justify-between gap-2 border animate-in fade-in ${
          isDark ? 'bg-stone-900 border-amber-500/40 text-stone-200' : 'bg-amber-50 border-amber-300 text-stone-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
          {sheetsConfig.spreadsheetUrl && (
            <a
              href={sheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 font-bold hover:underline flex items-center gap-1 text-xs"
            >
              Buka Sheets <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Time Range Pills */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold mr-1 flex items-center gap-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
          <Calendar className="w-3.5 h-3.5" /> Periode:
        </span>
        {[
          { id: 'today', label: 'Hari Ini' },
          { id: '7days', label: '7 Hari Terakhir' },
          { id: 'all', label: 'Semua Riwayat' }
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setTimeRange(r.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              timeRange === r.id
                ? 'bg-amber-500 border-amber-500 text-stone-950 font-black shadow-sm'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 shadow-sm'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Total Omset Bersih</span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            Rp {netRevenue.toLocaleString('id-ID')}
          </p>
          <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            Subtotal Rp {grossRevenue.toLocaleString('id-ID')}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Estimasi Laba Kotor</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            Rp {grossProfit.toLocaleString('id-ID')}
          </p>
          <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            Setelah dikurangi HPP bahan
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Transaksi Selesai</span>
          <p className="text-2xl font-black mt-1">
            {completedOrders.length} Pesanan
          </p>
          <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            Rata-rata: Rp {aov.toLocaleString('id-ID')} / bill
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Total Diskon Diberikan</span>
          <p className="text-2xl font-black text-rose-500 mt-1">
            Rp {totalDiscounts.toLocaleString('id-ID')}
          </p>
          <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            Promo voucher & potongan
          </span>
        </div>
      </div>

      {/* Analytics Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Products */}
        <div className={`p-5 rounded-3xl border space-y-4 ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">5 Menu Terlaris (Volume Penjualan)</h3>
            <span className="text-xs text-amber-500 font-semibold">Paling Diminati</span>
          </div>

          <div className="space-y-3">
            {topItems.length === 0 ? (
              <p className="text-xs opacity-60">Belum ada transaksi di periode ini.</p>
            ) : (
              topItems.map((item, idx) => {
                const maxQty = topItems[0]?.qty || 1;
                const percentage = Math.round((item.qty / maxQty) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold">{idx + 1}. {item.name}</span>
                      <span className="font-bold text-amber-500">{item.qty} Porsi (Rp {item.revenue.toLocaleString('id-ID')})</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-stone-950' : 'bg-stone-100'
                    }`}>
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className={`p-5 rounded-3xl border space-y-4 flex flex-col justify-between ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Distribusi Metode Pembayaran</h3>
              <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Total Omset</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-bold">
                    <QrCode className="w-3.5 h-3.5 text-amber-500" /> QRIS Dinamis
                  </span>
                  <span className="font-bold text-amber-500">
                    Rp {paymentBreakdown.qris.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                  isDark ? 'bg-stone-950' : 'bg-stone-100'
                }`}>
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${netRevenue > 0 ? (paymentBreakdown.qris / netRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Banknote className="w-3.5 h-3.5 text-emerald-500" /> Tunai (Cash)
                  </span>
                  <span className="font-bold text-emerald-500">
                    Rp {paymentBreakdown.cash.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                  isDark ? 'bg-stone-950' : 'bg-stone-100'
                }`}>
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${netRevenue > 0 ? (paymentBreakdown.cash / netRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" /> EDC / Transfer Bank
                  </span>
                  <span className="font-bold text-blue-500">
                    Rp {paymentBreakdown.debit.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                  isDark ? 'bg-stone-950' : 'bg-stone-100'
                }`}>
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${netRevenue > 0 ? (paymentBreakdown.debit / netRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className={`text-[11px] pt-3 border-t ${isDark ? 'border-stone-850 text-stone-500' : 'border-stone-100 text-stone-400'}`}>
            Transaksi otomatis terbagi dan tersimpan ke Google Sheets pada lembar "Transaksi_Kasir".
          </p>
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className={`rounded-3xl overflow-hidden shadow-xl border ${
        isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200'
      }`}>
        <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
        }`}>
          <h3 className="font-bold text-sm">
            Daftar Riwayat Transaksi ({filteredOrders.length} Pesanan)
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-stone-500' : 'text-stone-400'
              }`} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari struk / nama..."
                className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                  isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-stone-300 text-stone-900'
                }`}
              />
            </div>

            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className={`px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                isDark ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white border-stone-300 text-stone-800'
              }`}
            >
              <option value="all">Semua Pembayaran</option>
              <option value="cash">Tunai</option>
              <option value="qris">QRIS</option>
              <option value="debit">EDC / Debit</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
            <thead className={`uppercase text-[10px] tracking-wider border-b ${
              isDark ? 'bg-stone-950 border-stone-850 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500'
            }`}>
              <tr>
                <th className="p-3.5">No. Struk</th>
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5">Tipe & Meja</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Total Bayar</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5">Kasir</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Struk Thermal</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-stone-850' : 'divide-stone-100'}`}>
              {filteredOrders.map(order => (
                <tr key={order.id} className={`transition-colors ${
                  isDark ? 'hover:bg-stone-850/50' : 'hover:bg-stone-50'
                }`}>
                  <td className="p-3.5 font-bold font-mono text-amber-500">
                    {order.orderNumber}
                  </td>
                  <td className="p-3.5 opacity-75">
                    {new Date(order.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5">
                    {order.type === 'dine_in' ? (
                      <span className="font-semibold">Meja {order.tableNumber}</span>
                    ) : (
                      <span className="text-purple-500 font-semibold">Takeaway</span>
                    )}
                  </td>
                  <td className="p-3.5 truncate max-w-[120px]">
                    {order.customerName}
                  </td>
                  <td className="p-3.5 font-bold">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5 uppercase font-mono font-bold text-amber-500">
                    {order.paymentMethod}
                  </td>
                  <td className="p-3.5 opacity-75">
                    {order.cashierName}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      order.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : order.status === 'ready'
                        ? 'bg-blue-500/15 text-blue-500'
                        : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setActiveReceiptOrder(order)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto border ${
                        isDark 
                          ? 'bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 border-stone-700' 
                          : 'bg-stone-100 hover:bg-amber-500 hover:text-stone-950 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Lihat Struk</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
