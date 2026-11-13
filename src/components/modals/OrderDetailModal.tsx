import React from 'react';
import { 
  X, 
  Printer, 
  Banknote, 
  Clock, 
  Utensils, 
  ShoppingBag, 
  CheckCircle2, 
  Flame, 
  Coffee,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPayCashier?: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onPayCashier
}) => {
  const { updateOrderStatus, setActiveReceiptOrder, theme } = useCafe();

  if (!isOpen || !order) return null;

  const isDark = theme === 'dark';
  const isPaid = order.paymentMethod === 'qris' || order.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-stone-900 border-stone-850 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-mono font-black text-sm">
              #{order.orderNumber || order.id.slice(-4).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">Detail Tiket Pesanan</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  order.type === 'dine_in'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {order.type === 'dine_in' ? `Meja ${order.tableNumber || '?'}` : 'Takeaway'}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Waktu pesan: {new Date(order.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-2xl transition-colors ${
              isDark ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-200' : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer & Status Bar */}
        <div className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
          isDark ? 'bg-stone-950/40 border-stone-850' : 'bg-stone-100/70 border-stone-200'
        }`}>
          <div>
            <span className={`text-[11px] block ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Nama Tamu:</span>
            <span className="font-bold text-amber-400 text-sm">
              {order.customerName || 'Pelanggan'}
            </span>
          </div>

          <div>
            <span className={`text-[11px] block ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Status Dapur:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-xs inline-block ${
              order.status === 'pending'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                : order.status === 'preparing'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {order.status === 'pending' ? 'Baru Masuk' : order.status === 'preparing' ? 'Sedang Diracik' : 'Siap Antar'}
            </span>
          </div>

          <div>
            <span className={`text-[11px] block ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Status Pembayaran:</span>
            <span className={`font-bold text-xs flex items-center gap-1 ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
              <Banknote className="w-3.5 h-3.5" />
              {isPaid ? `Lunas (${order.paymentMethod?.toUpperCase() || 'QRIS'})` : 'Belum Bayar'}
            </span>
          </div>
        </div>

        {/* Item List */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 divide-y ${
          isDark ? 'divide-stone-800/80' : 'divide-stone-200'
        }`}>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 pb-1">
            Daftar Menu ({order.items.reduce((s, i) => s + i.quantity, 0)} item)
          </h4>

          {order.items.map((it, idx) => (
            <div key={it.id || idx} className="pt-2.5 first:pt-0">
              <div className={`p-3 rounded-2xl border ${
                isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950">
                        {it.quantity}x
                      </span>
                      <span className="font-black text-sm">{it.menuItem.name}</span>
                    </div>

                    {(it.selectedOptions.temperature || it.selectedOptions.notes || (it.selectedOptions.extras && it.selectedOptions.extras.length > 0)) && (
                      <div className="mt-1.5 pl-6 text-xs space-y-0.5 opacity-80">
                        {it.selectedOptions.temperature && (
                          <p>• Suhu: {it.selectedOptions.temperature} | Gula: {it.selectedOptions.sugar || 'Normal'}</p>
                        )}
                        {(it.selectedOptions.extras || []).length > 0 && (
                          <p className="text-amber-400">• Extras: {it.selectedOptions.extras?.map(e => e.name).join(', ')}</p>
                        )}
                        {it.selectedOptions.notes && (
                          <p className="italic text-amber-300">"{it.selectedOptions.notes}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="font-bold text-amber-400 text-sm">
                    Rp {(it.unitPrice * it.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Billing & Actions */}
        <div className={`p-4 sm:p-5 border-t space-y-3 ${
          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">Total Pembayaran:</span>
            <span className="text-xl font-black text-amber-500">
              Rp {order.totalAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveReceiptOrder(order);
                onClose();
              }}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors ${
                isDark ? 'bg-stone-900 hover:bg-stone-800 text-stone-200 border-stone-800' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
              }`}
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span>Cetak Struk</span>
            </button>

            {!isPaid && onPayCashier && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPayCashier(order);
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black text-xs rounded-2xl shadow flex items-center justify-center gap-1.5"
              >
                <Banknote className="w-4 h-4" />
                <span>Bayar di Kasir</span>
              </button>
            )}

            {isPaid && order.status === 'pending' && (
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(order.id, 'preparing');
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-stone-950 font-black text-xs rounded-2xl shadow flex items-center justify-center gap-1.5"
              >
                <span>Mulai Racik</span>
              </button>
            )}

            {isPaid && order.status === 'preparing' && (
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(order.id, 'ready');
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-2xl shadow flex items-center justify-center gap-1.5"
              >
                <span>Siap Diantar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
