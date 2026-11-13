import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Coffee, 
  Utensils, 
  Tag, 
  Banknote,
  Receipt
} from 'lucide-react';
import { useCafe } from '../../context/CafeContext';

interface CartDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
}

export const CartDetailModal: React.FC<CartDetailModalProps> = ({
  isOpen,
  onClose,
  onProceedToPayment
}) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    orderType,
    setOrderType,
    selectedTableNumber,
    setSelectedTableNumber,
    customerName,
    setCustomerName,
    subtotalAmount,
    discountAmount,
    discountCode,
    taxAmount,
    totalAmount,
    tables,
    theme
  } = useCafe();

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-stone-950/70 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Rincian Lengkap Pesanan</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-stone-950">
                  {totalItemCount} Item
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Periksa menu yang dipesan sebelum melanjutkan pembayaran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Kosongkan semua item di keranjang?')) {
                    clearCart();
                    onClose();
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kosongkan</span>
              </button>
            )}
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
        </div>

        {/* Order Details Banner: Dine-in / Table info */}
        <div className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark ? 'bg-stone-950/40 border-stone-800/80' : 'bg-stone-100/70 border-stone-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 ${
              orderType === 'dine_in'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {orderType === 'dine_in' ? <Utensils className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
              <span>{orderType === 'dine_in' ? `Dine-In (Meja ${selectedTableNumber})` : 'Takeaway (Bungkus)'}</span>
            </span>

            {customerName && (
              <span className={`px-2.5 py-1 rounded-xl font-medium ${isDark ? 'bg-stone-800 text-stone-300' : 'bg-white border text-stone-700'}`}>
                Tamu: <strong className="text-amber-500">{customerName}</strong>
              </span>
            )}
          </div>

          <div className="text-right">
            <span className={`text-[11px] block ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Waktu Input:</span>
            <span className="font-mono font-bold text-amber-500">
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </div>
        </div>

        {/* Item List (Very large, spacious, high contrast) */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y ${
          isDark ? 'divide-stone-800/80' : 'divide-stone-200'
        }`}>
          {cart.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
                isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-100 text-stone-400'
              }`}>
                <Coffee className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold">Keranjang pesanan masih kosong</p>
              <p className="text-xs max-w-xs">
                Silakan pilih menu minuman atau makanan di katalog kasir terlebih dahulu.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const itemTotal = item.unitPrice * item.quantity;
              return (
                <div key={item.id} className="pt-3 first:pt-0">
                  <div className={`p-3.5 rounded-2xl border transition-all ${
                    isDark ? 'bg-stone-950/60 border-stone-800 hover:border-amber-500/30' : 'bg-stone-50 border-stone-200 hover:border-amber-500/30'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950">
                            #{idx + 1}
                          </span>
                          <h4 className="font-black text-sm sm:text-base leading-tight">
                            {item.menuItem.name}
                          </h4>
                        </div>

                        {/* Price Breakdown */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                          <span>Rp {item.unitPrice.toLocaleString('id-ID')}</span>
                          <span className="opacity-60">× {item.quantity}</span>
                          <span className="font-black text-sm text-amber-400">= Rp {itemTotal.toLocaleString('id-ID')}</span>
                        </div>

                        {/* Custom Options / Variants / Notes */}
                        {(item.selectedOptions.temperature || (item.selectedOptions.extras && item.selectedOptions.extras.length > 0) || item.selectedOptions.notes) && (
                          <div className={`mt-2 p-2 rounded-xl text-xs space-y-1 ${
                            isDark ? 'bg-stone-900 border border-stone-800 text-stone-300' : 'bg-white border border-stone-200 text-stone-700'
                          }`}>
                            {item.selectedOptions.temperature && (
                              <p className="font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Varian: <strong>{item.selectedOptions.temperature}</strong> | Gula: <strong>{item.selectedOptions.sugar || 'Normal'}</strong></span>
                              </p>
                            )}
                            {(item.selectedOptions.extras || []).length > 0 && (
                              <p className="font-medium flex items-center gap-1.5 text-amber-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Topping: {item.selectedOptions.extras?.map(e => e.name).join(', ')}</span>
                              </p>
                            )}
                            {item.selectedOptions.notes && (
                              <p className="italic text-[11px] opacity-80 pl-3 border-l-2 border-amber-500">
                                "{item.selectedOptions.notes}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Delete */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className={`flex items-center gap-1 border rounded-xl p-1 shadow-sm ${
                          isDark ? 'bg-stone-900 border-stone-750' : 'bg-white border-stone-300'
                        }`}>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-stone-800 text-stone-300' : 'hover:bg-stone-100 text-stone-700'
                            }`}
                            title="Kurangi"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-black text-sm w-7 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-stone-800 text-stone-300' : 'hover:bg-stone-100 text-stone-700'
                            }`}
                            title="Tambah"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className={`p-4 sm:p-5 border-t space-y-3 ${
            isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
          }`}>
            {/* Bill Breakdown */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl border text-xs ${
              isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-stone-200'
            }`}>
              <div>
                <span className={`block text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Subtotal</span>
                <span className="font-bold">Rp {subtotalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Pajak PB1 (10%)</span>
                <span className="font-bold">Rp {taxAmount.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Diskon Promo</span>
                <span className={`font-bold ${discountAmount > 0 ? 'text-emerald-500' : ''}`}>
                  {discountAmount > 0 ? `-Rp ${discountAmount.toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>
              <div className="text-right sm:text-left">
                <span className={`block text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>TOTAL TAGIHAN</span>
                <span className="font-black text-amber-500 text-base">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-colors flex items-center justify-center gap-1.5 ${
                  isDark ? 'bg-stone-900 hover:bg-stone-850 text-stone-200 border-stone-800' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                <span>+ Tambah Menu Lain</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToPayment();
                }}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-2xl shadow-lg shadow-amber-950/30 flex items-center justify-between text-xs sm:text-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  <span>Bayar Sekarang (Tunai / QRIS)</span>
                </div>
                <div className="flex items-center gap-1 font-black">
                  <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
