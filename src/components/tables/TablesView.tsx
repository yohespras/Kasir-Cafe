import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Clock, 
  ArrowRightLeft, 
  CheckCircle2, 
  PlusCircle, 
  Receipt, 
  Sparkles, 
  X, 
  Coffee,
  QrCode,
  Printer,
  Smartphone,
  Banknote,
  DollarSign
} from 'lucide-react';
import { CafeTable, TableStatus, Order } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import { TableQrModal } from './TableQrModal';
import { TablePaymentModal } from './TablePaymentModal';

export const TablesView: React.FC = () => {
  const { 
    tables, 
    orders, 
    updateTableStatus, 
    transferTable, 
    clearTableBill, 
    setSelectedTableNumber, 
    setOrderType, 
    setActiveTab,
    openSelfOrderForTable,
    theme
  } = useCafe();

  const [activeZone, setActiveZone] = useState<'all' | 'indoor' | 'outdoor' | 'bar' | 'vip'>('all');
  const [selectedTable, setSelectedTable] = useState<CafeTable | null>(null);
  const [transferTarget, setTransferTarget] = useState<string>('');
  
  // Table QR modal states
  const [qrModalTable, setQrModalTable] = useState<CafeTable | null>(null);
  const [isBatchQrOpen, setIsBatchQrOpen] = useState(false);

  // Table Payment modal states
  const [paymentModalTable, setPaymentModalTable] = useState<CafeTable | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);

  const isDark = theme === 'dark';

  const filteredTables = tables.filter(t => activeZone === 'all' || t.zone === activeZone);

  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const cleaningCount = tables.filter(t => t.status === 'cleaning').length;

  const handleOpenPosForTable = (tableNumber: string) => {
    setSelectedTableNumber(tableNumber);
    setOrderType('dine_in');
    setActiveTab('pos');
  };

  const handleOpenPayment = (table: CafeTable, order: Order) => {
    setPaymentModalTable(table);
    setPaymentModalOrder(order);
    setSelectedTable(null);
  };

  const handleTransfer = () => {
    if (!selectedTable || !transferTarget) return;
    transferTable(selectedTable.number, transferTarget);
    setSelectedTable(null);
    setTransferTarget('');
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">Tersedia</span>;
      case 'occupied':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse">Terisi</span>;
      case 'reserved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">Reservasi</span>;
      case 'cleaning':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">Perlu Bersih</span>;
    }
  };

  return (
    <div className={`flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f2] text-stone-900'
    }`}>
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[10px] font-black uppercase tracking-wider border border-amber-500/25">
              Floor Plan & Table QR
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Manajemen Meja & QR Order
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Pantau status meja, cetak standee QR meja untuk pelanggan pesan mandiri, dan bayar tagihan tunai / QRIS.
          </p>
        </div>

        {/* Global Fast Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBatchQrOpen(true)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isDark 
                ? 'bg-stone-900 border-stone-800 text-stone-200 hover:border-amber-500/40 hover:text-amber-400' 
                : 'bg-white border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-600'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-500" />
            <span>Cetak Semua QR Meja</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('selforder')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mode Self-Order</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div>
            <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Meja Tersedia</p>
            <p className="text-2xl font-black text-emerald-500">{availableCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div>
            <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Sedang Terisi</p>
            <p className="text-2xl font-black text-amber-500">{occupiedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div>
            <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Reservasi</p>
            <p className="text-2xl font-black text-blue-500">{reservedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div>
            <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Dibersihkan</p>
            <p className="text-2xl font-black text-rose-500">{cleaningCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'Semua Area' },
          { id: 'indoor', label: 'Indoor Dining' },
          { id: 'bar', label: 'Area Bar' },
          { id: 'outdoor', label: 'Outdoor Garden' },
          { id: 'vip', label: 'Ruang VIP Senja' }
        ].map(zone => (
          <button
            key={zone.id}
            onClick={() => setActiveZone(zone.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
              activeZone === zone.id
                ? 'bg-amber-500 border-amber-500 text-stone-950 font-black shadow-md'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 shadow-sm'
            }`}
          >
            {zone.label}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map(tbl => {
          const activeOrder = orders.find(
            o => o.tableNumber === tbl.number && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
          );

          return (
            <div
              key={tbl.id}
              onClick={() => setSelectedTable(tbl)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                tbl.status === 'occupied'
                  ? isDark
                    ? 'bg-gradient-to-br from-stone-900 to-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-950/20'
                    : 'bg-amber-50/70 border-amber-300 shadow-md'
                  : isDark
                  ? 'bg-stone-900 border-stone-800 hover:border-stone-700 hover:-translate-y-0.5'
                  : 'bg-white border-stone-200 hover:border-amber-400 hover:-translate-y-0.5 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider block mb-0.5 ${
                      isDark ? 'text-stone-400' : 'text-stone-500'
                    }`}>
                      Zona {tbl.zone}
                    </span>
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <span>Meja {tbl.number}</span>
                    </h3>
                  </div>
                  {getStatusBadge(tbl.status)}
                </div>

                <div className={`flex items-center gap-3 mt-3 text-xs ${
                  isDark ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {tbl.capacity} orang
                  </span>
                  {tbl.occupiedSince && (
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Mulai {tbl.occupiedSince}
                    </span>
                  )}
                </div>
              </div>

              {/* Occupied Order Detailed Snapshot - Visibly Highlighted */}
              {activeOrder && (
                <div className={`mt-3 p-3 rounded-2xl text-xs space-y-2 border transition-all ${
                  isDark ? 'bg-stone-950/95 border-amber-500/40 shadow-inner' : 'bg-amber-50/95 border-amber-300 shadow-sm'
                }`}>
                  {/* Order Meta Header */}
                  <div className="flex justify-between items-center pb-1.5 border-b border-stone-800/60">
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-500">
                          #{activeOrder.orderNumber}
                        </span>
                        <span className="text-[9px] text-stone-400">
                          • {activeOrder.items.reduce((s, i) => s + i.quantity, 0)} Item
                        </span>
                      </div>
                      <span className="text-xs font-bold text-stone-200 block truncate">
                        {activeOrder.customerName || `Tamu Meja ${tbl.number}`}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${
                      activeOrder.status === 'ready'
                        ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 animate-pulse'
                        : activeOrder.status === 'preparing'
                        ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/40'
                        : 'bg-amber-500/25 text-amber-400 border border-amber-500/40'
                    }`}>
                      {activeOrder.status === 'ready' ? 'Siap Antar' : activeOrder.status === 'preparing' ? 'Diracik' : 'Baru Masuk'}
                    </span>
                  </div>

                  {/* Clearly Visible Itemized Menu List */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 py-0.5">
                    {activeOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs leading-snug">
                        <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-2">
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black text-[10px] flex-shrink-0">
                            {it.quantity}x
                          </span>
                          <span className="font-bold text-stone-100 truncate">
                            {it.menuItem.name}
                          </span>
                          {it.selectedOptions.temperature && (
                            <span className="text-[9px] text-stone-400 flex-shrink-0">
                              ({it.selectedOptions.temperature})
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] font-bold text-amber-400 flex-shrink-0">
                          Rp {it.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total Tagihan */}
                  <div className="pt-1.5 border-t border-stone-800/60 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-stone-400">Total Tagihan:</span>
                    <span className="text-amber-500 text-sm font-black font-mono">
                      Rp {activeOrder.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Quick Pay Button right on table card */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPayment(tbl, activeOrder);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Bayar Tagihan (QRIS / Tunai)</span>
                  </button>
                </div>
              )}

              {/* Action buttons preview on card (QR & Detail) */}
              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-stone-850' : 'border-stone-100'
              }`}>
                {/* QR Meja Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQrModalTable(tbl);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-stone-950 border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/40' 
                      : 'bg-white border-stone-200 text-stone-700 hover:text-amber-600 hover:border-amber-400'
                  }`}
                  title="Lihat / Cetak QR Standee Meja Ini"
                >
                  <QrCode className="w-3 h-3 text-amber-500" />
                  <span>QR Meja</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTable(tbl)}
                  className="text-amber-500 font-bold hover:underline cursor-pointer"
                >
                  Detail & Status →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Detail & Action Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5 border ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className={`flex items-start justify-between border-b pb-4 ${
              isDark ? 'border-stone-800' : 'border-stone-100'
            }`}>
              <div>
                <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">
                  Zona {selectedTable.zone} • Kapasitas {selectedTable.capacity} Orang
                </span>
                <h3 className="text-2xl font-black">Meja {selectedTable.number}</h3>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className={`p-2 rounded-full cursor-pointer ${
                  isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Changers */}
            <div>
              <label className={`text-xs block mb-2 font-bold ${
                isDark ? 'text-stone-400' : 'text-stone-600'
              }`}>
                Ubah Status Meja:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { status: 'available', label: 'Tersedia' },
                  { status: 'occupied', label: 'Terisi' },
                  { status: 'reserved', label: 'Reservasi' },
                  { status: 'cleaning', label: 'Dibersihkan' }
                ].map(s => (
                  <button
                    key={s.status}
                    type="button"
                    onClick={() => {
                      updateTableStatus(selectedTable.id, s.status as TableStatus);
                      setSelectedTable({ ...selectedTable, status: s.status as TableStatus });
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedTable.status === s.status
                        ? 'bg-amber-500 border-amber-500 text-stone-950 font-black'
                        : isDark
                        ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Order Summary & Direct Payment (QRIS / Tunai) */}
            {(() => {
              const activeOrder = orders.find(
                o => o.tableNumber === selectedTable.number && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
              );
              if (!activeOrder) return null;

              return (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between border-b border-stone-800/40 pb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                        Tagihan Meja Aktif
                      </span>
                      <h4 className="font-bold text-sm">Pesanan #{activeOrder.orderNumber}</h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Pemesan: <strong className="text-stone-200">{activeOrder.customerName}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block">Total:</span>
                      <span className="text-lg font-black text-amber-500 font-mono">
                        Rp {activeOrder.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* List of items in modal */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-amber-400">{it.quantity}x</span>
                          <span className="font-semibold text-stone-200 truncate">{it.menuItem.name}</span>
                          {it.selectedOptions.temperature && (
                            <span className="text-[10px] text-stone-400">({it.selectedOptions.temperature})</span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-stone-300">
                          Rp {it.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Primary Pay Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(selectedTable, activeOrder)}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Bayar Tagihan Sekarang (QRIS / Tunai)</span>
                  </button>
                </div>
              );
            })()}

            {/* If Occupied: Show Transfer Target */}
            {selectedTable.status === 'occupied' && (
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Pindah Meja (Transfer Bill)
                </h4>
                <div className="flex gap-2">
                  <select
                    value={transferTarget}
                    onChange={e => setTransferTarget(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-stone-900 border-stone-700 text-stone-200' : 'bg-white border-stone-300 text-stone-900'
                    }`}
                  >
                    <option value="">Pilih meja tujuan pindah...</option>
                    {tables
                      .filter(t => t.number !== selectedTable.number && t.status === 'available')
                      .map(t => (
                        <option key={t.id} value={t.number}>
                          Meja {t.number} ({t.zone} - Tersedia)
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={!transferTarget}
                    onClick={handleTransfer}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Pindahkan
                  </button>
                </div>
              </div>
            )}

            {/* Table QR Standee & Self-Order Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setQrModalTable(selectedTable);
                  setSelectedTable(null);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark ? 'bg-stone-950 border-stone-850 hover:bg-stone-850 text-stone-200' : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-amber-500" />
                <span>Cetak QR Meja Ini</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openSelfOrderForTable(selectedTable.number);
                  setSelectedTable(null);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark ? 'bg-stone-950 border-stone-850 hover:bg-stone-850 text-stone-200' : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                <span>Buka Self-Order</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <button
                type="button"
                onClick={() => {
                  handleOpenPosForTable(selectedTable.number);
                  setSelectedTable(null);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark ? 'bg-stone-900 border-stone-750 text-stone-200 hover:bg-stone-850' : 'bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-amber-500" />
                <span>Tambah / Buka Menu POS (Meja {selectedTable.number})</span>
              </button>

              {selectedTable.status === 'occupied' && (
                <button
                  type="button"
                  onClick={() => {
                    clearTableBill(selectedTable.number);
                    setSelectedTable(null);
                  }}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-stone-950 hover:bg-stone-850 text-stone-400 border-stone-800'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  Kosongkan Meja Tanpa Tagihan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Meja (Single / Batch) */}
      {(qrModalTable || isBatchQrOpen) && (
        <TableQrModal
          table={qrModalTable}
          allTables={tables}
          isBatchMode={isBatchQrOpen}
          onClose={() => {
            setQrModalTable(null);
            setIsBatchQrOpen(false);
          }}
        />
      )}

      {/* Modal Bayar Tagihan Meja (QRIS / Tunai) */}
      {paymentModalTable && paymentModalOrder && (
        <TablePaymentModal
          table={paymentModalTable}
          order={paymentModalOrder}
          isOpen={!!paymentModalTable}
          onClose={() => {
            setPaymentModalTable(null);
            setPaymentModalOrder(null);
          }}
        />
      )}
    </div>
  );
};
