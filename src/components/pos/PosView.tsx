import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  Utensils, 
  ShoppingBag, 
  Sparkles, 
  Flame, 
  AlertCircle,
  Coffee,
  Check,
  ArrowRight,
  ClipboardList,
  Clock,
  Printer,
  Banknote,
  Eye,
  Maximize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MenuItem, CategoryType, SelectedOptions, Order } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import { ItemCustomizeModal } from '../modals/ItemCustomizeModal';
import { PaymentModal } from '../modals/PaymentModal';
import { TablePaymentModal } from '../tables/TablePaymentModal';
import { CartDetailModal } from '../modals/CartDetailModal';
import { OrderDetailModal } from '../modals/OrderDetailModal';

const CATEGORIES: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'all', label: 'Semua Menu', icon: '✨' },
  { id: 'signature', label: 'Signature Kopi', icon: '☕' },
  { id: 'coffee', label: 'Espresso Bar', icon: '⚡' },
  { id: 'manual_brew', label: 'Manual Brew V60', icon: '🧪' },
  { id: 'non_coffee', label: 'Non-Coffee & Teh', icon: '🍵' },
  { id: 'food', label: 'Makanan Utama', icon: '🍛' },
  { id: 'snack', label: 'Bites & Snack', icon: '🍟' },
  { id: 'dessert', label: 'Pastry & Dessert', icon: '🥐' }
];

export const PosView: React.FC = () => {
  const {
    menuItems,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    orderType,
    setOrderType,
    selectedTableNumber,
    setSelectedTableNumber,
    customerName,
    setCustomerName,
    orderNotes,
    setOrderNotes,
    discountCode,
    setDiscountCode,
    discountAmount,
    taxAmount,
    subtotalAmount,
    totalAmount,
    applyPromoCode,
    tables,
    orders,
    updateOrderStatus,
    setActiveReceiptOrder,
    theme
  } = useCafe();

  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  
  // Right panel tab & order viewing states
  const [posRightTab, setPosRightTab] = useState<'cart' | 'active_orders'>('cart');
  const [orderFilter, setOrderFilter] = useState<'all' | 'dine_in' | 'takeaway'>('all');
  const [tablePaymentOrder, setTablePaymentOrder] = useState<Order | null>(null);
  const [isCartDetailOpen, setIsCartDetailOpen] = useState(false);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready');
  }, [orders]);

  const filteredActiveOrders = useMemo(() => {
    return activeOrders.filter(o => {
      if (orderFilter === 'dine_in') return o.type === 'dine_in';
      if (orderFilter === 'takeaway') return o.type === 'takeaway';
      return true;
    });
  }, [activeOrders, orderFilter]);

  const isDark = theme === 'dark';

  // Filter menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = codeToApply || discountCode;
    const res = applyPromoCode(code);
    setPromoMessage({ text: res.message, isError: !res.success });
    setTimeout(() => setPromoMessage(null), 3500);
  };

  const handleCustomizedConfirm = (item: MenuItem, options: SelectedOptions, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
      addToCart(item, options);
    }
  };

  return (
    <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden transition-colors ${
      isDark ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f2] text-stone-900'
    }`}>
      {/* Left Area: Catalog, Filter, Search, Menu Cards */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 lg:p-6 space-y-4 sm:space-y-5">
        {/* Search & Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-stone-500' : 'text-stone-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari kopi, makanan, cemilan..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${
                isDark 
                  ? 'bg-stone-900 border-stone-800 text-stone-200 placeholder-stone-500' 
                  : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 shadow-sm'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                  isDark ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Reset
              </button>
            )}
          </div>

          <div className={`flex items-center gap-2 text-xs self-end sm:self-auto ${
            isDark ? 'text-stone-400' : 'text-stone-500'
          }`}>
            <span>Ditemukan: <strong className="text-amber-500 font-bold">{filteredItems.length}</strong> menu</span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold shadow-md shadow-amber-950/20'
                    : isDark
                    ? 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                    : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 shadow-sm'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4 pb-20 lg:pb-6">
          {filteredItems.map(item => {
            const isSoldOut = !item.isAvailable || item.stock <= 0;
            const isLowStock = item.stock > 0 && item.stock <= 5;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isSoldOut) return;
                  if (item.options?.iceOptions?.length || item.options?.sugarOptions?.length || item.options?.additions?.length) {
                    setCustomizingItem(item);
                  } else {
                    addToCart(item);
                  }
                }}
                className={`group relative rounded-3xl overflow-hidden shadow-sm transition-all flex flex-col justify-between border ${
                  isDark
                    ? 'bg-stone-900 border-stone-850 hover:border-amber-500/50 hover:shadow-amber-950/20'
                    : 'bg-white border-stone-200 hover:border-amber-400 hover:shadow-md'
                } ${
                  isSoldOut
                    ? 'opacity-55 cursor-not-allowed'
                    : 'hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]'
                }`}
              >
                {/* Image & Badges */}
                <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-stone-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow-sm flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" />
                        {item.badge}
                      </span>
                    )}
                    {isLowStock && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                        Sisa {item.stock}
                      </span>
                    )}
                  </div>

                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-xl tracking-wider uppercase shadow-lg">
                        Habis Terjual
                      </span>
                    </div>
                  )}

                  {/* Price Tag in Image */}
                  <div className="absolute bottom-2 right-2.5 px-2.5 py-1 bg-stone-950/85 backdrop-blur-sm rounded-xl text-amber-400 font-extrabold text-xs border border-amber-500/30">
                    Rp {item.price.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-bold text-sm leading-snug line-clamp-1 group-hover:text-amber-500 transition-colors ${
                      isDark ? 'text-stone-100' : 'text-stone-900'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-[11px] line-clamp-2 mt-1 leading-relaxed ${
                      isDark ? 'text-stone-400' : 'text-stone-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  <div className={`mt-3 pt-2 border-t flex items-center justify-between ${
                    isDark ? 'border-stone-800' : 'border-stone-100'
                  }`}>
                    <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      Stok: <strong className={isDark ? 'text-stone-300' : 'text-stone-700'}>{item.stock}</strong>
                    </span>

                    <button
                      type="button"
                      disabled={isSoldOut}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.options?.iceOptions?.length || item.options?.sugarOptions?.length || item.options?.additions?.length) {
                          setCustomizingItem(item);
                        } else {
                          addToCart(item);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-stone-950 border border-amber-500/30 transition-all flex items-center gap-1 text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Pilih</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Area: Order Cart & Bill Checkout Drawer OR Active Orders Queue */}
      <div className={`w-full lg:w-96 border-t lg:border-t-0 lg:border-l flex flex-col h-full min-h-0 select-none overflow-hidden transition-colors ${
        isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200'
      }`}>
        {/* Top Header Mode Switcher: Input Kasir vs Antrean Pesanan */}
        <div className={`p-2.5 border-b flex items-center gap-1.5 ${
          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-100 border-stone-200'
        }`}>
          <button
            type="button"
            onClick={() => setPosRightTab('cart')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              posRightTab === 'cart'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : isDark ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-850' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Keranjang</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              posRightTab === 'cart' ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/20 text-amber-500'
            }`}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPosRightTab('active_orders')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative ${
              posRightTab === 'active_orders'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : isDark ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-850' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Antrean Pesanan</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              posRightTab === 'active_orders' ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/20 text-amber-500'
            }`}>
              {activeOrders.length}
            </span>
            {activeOrders.length > 0 && posRightTab !== 'active_orders' && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {posRightTab === 'active_orders' ? (
          /* Active Orders Live Queue Content */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter buttons */}
            <div className={`p-3 border-b flex items-center gap-1.5 text-xs ${
              isDark ? 'border-stone-850 bg-stone-950/40' : 'border-stone-200 bg-stone-50'
            }`}>
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  orderFilter === 'all'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                Semua ({activeOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('dine_in')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  orderFilter === 'dine_in'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                Dine-In ({activeOrders.filter(o => o.type === 'dine_in').length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('takeaway')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  orderFilter === 'takeaway'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                Takeaway ({activeOrders.filter(o => o.type === 'takeaway').length})
              </button>
            </div>

            {/* List of Orders */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${
              isDark ? 'divide-stone-800' : 'divide-stone-200'
            }`}>
              {activeOrders.filter(o => orderFilter === 'all' || o.type === orderFilter).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-60">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-stone-850 text-stone-500' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold">Tidak ada antrean pesanan</p>
                  <p className="text-[11px] max-w-[200px]">
                    Pesanan baru dari kasir atau self-order QR meja akan muncul di sini secara otomatis.
                  </p>
                </div>
              ) : (
                activeOrders
                  .filter(o => orderFilter === 'all' || o.type === orderFilter)
                  .map(ord => {
                    const isOrderPaid = ord.paymentMethod === 'qris' || ord.status === 'completed';
                    return (
                    <div
                      key={ord.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isDark 
                          ? 'bg-stone-950/80 border-stone-800 hover:border-amber-500/40' 
                          : 'bg-stone-50/90 border-stone-200 hover:border-amber-500/40'
                      }`}
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-dashed border-stone-700/40">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-amber-500">
                            #{ord.orderNumber || ord.id.slice(-4).toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                            ord.type === 'dine_in'
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {ord.type === 'dine_in' ? `Meja ${ord.tableNumber || '?'}` : 'Takeaway'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                              : ord.status === 'preparing'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {ord.status === 'pending' ? 'Baru Masuk' : ord.status === 'preparing' ? 'Sedang Diracik' : 'Siap Antar'}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Timestamp */}
                      <div className="flex items-center justify-between text-[11px] mb-2 opacity-80">
                        <span className="font-medium truncate max-w-[160px]">
                          Tamu: <strong className="text-amber-400">{ord.customerName || 'Pelanggan'}</strong>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3 opacity-60" />
                          {new Date(ord.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Itemized breakdown (Sangat jelas & terlihat) */}
                      <div className={`p-2 rounded-xl mb-2.5 space-y-1.5 text-xs ${
                        isDark ? 'bg-stone-900 border border-stone-850' : 'bg-white border border-stone-200'
                      }`}>
                        {ord.items.map(it => (
                          <div key={it.id} className="flex items-start justify-between gap-1.5">
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-amber-500 mr-1.5">{it.quantity}x</span>
                              <span className="font-medium">{it.menuItem.name}</span>
                              {(it.selectedOptions.temperature || it.selectedOptions.notes) && (
                                <p className="text-[10px] opacity-70 pl-5">
                                  {it.selectedOptions.temperature && `[${it.selectedOptions.temperature}] `}
                                  {it.selectedOptions.notes && `"${it.selectedOptions.notes}"`}
                                </p>
                              )}
                            </div>
                            <span className="font-semibold text-right text-[11px]">
                              Rp {(it.unitPrice * it.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Payment Badge */}
                      <div className="flex items-center justify-between pt-1 mb-3 text-xs">
                        <div>
                          <span className="text-[10px] opacity-60 block">Status Bayar</span>
                          <span className={`font-bold text-[11px] flex items-center gap-1 ${
                            isOrderPaid ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            <Banknote className="w-3 h-3" />
                            {isOrderPaid 
                              ? `Lunas (${ord.paymentMethod?.toUpperCase() || 'QRIS'})` 
                              : 'Belum Bayar (Meja)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] opacity-60 block">Total Tagihan</span>
                          <span className="font-black text-amber-500 text-sm">
                            Rp {ord.totalAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailOrder(ord)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-colors ${
                            isDark 
                              ? 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-stone-950 border-amber-500/30' 
                              : 'bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-stone-950 border-amber-300'
                          }`}
                          title="Lihat rincian lengkap tiket pesanan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveReceiptOrder(ord)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-colors ${
                            isDark 
                              ? 'bg-stone-900 hover:bg-stone-850 text-stone-300 border-stone-800' 
                              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-500" />
                          <span className="hidden sm:inline">Struk</span>
                        </button>

                        {!isOrderPaid ? (
                          <button
                            type="button"
                            onClick={() => setTablePaymentOrder(ord)}
                            className="flex-1 py-1.5 px-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 hover:from-emerald-400 hover:to-teal-400 flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Bayar Kasir</span>
                          </button>
                        ) : ord.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'preparing')}
                            className="py-1.5 px-2 rounded-xl text-xs font-bold bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-stone-950 border border-sky-500/30 flex items-center justify-center gap-1 transition-all"
                          >
                            <span>Racik Menu</span>
                          </button>
                        ) : ord.status === 'preparing' ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'ready')}
                            className="py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-stone-950 border border-emerald-500/30 flex items-center justify-center gap-1 transition-all"
                          >
                            <span>Siap Antar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'completed')}
                            className="py-1.5 px-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center justify-center gap-1 transition-all"
                          >
                            <span>Selesai</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Cart View */
          <>
            {/* Active order notification banner inside cart */}
            {activeOrders.length > 0 && (
              <div 
                onClick={() => setPosRightTab('active_orders')}
                className="cursor-pointer p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border-b border-amber-500/30 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Ada {activeOrders.length} pesanan aktif di antrean!</span>
                </div>
                <span className="text-[10px] text-amber-400 underline font-semibold">Lihat &rarr;</span>
              </div>
            )}

            {/* Cart Header (Pinned Shrink-0) */}
            <div className={`p-3 border-b shrink-0 ${
              isDark ? 'bg-stone-950/90 border-stone-850' : 'bg-stone-50/90 border-stone-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <h2 className="font-bold text-sm">Pesanan Kasir</h2>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-stone-950">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {cart.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsCartDetailOpen(true)}
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1 transition-all"
                        title="Buka rincian lengkap pesanan"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>Rincian</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 flex items-center gap-1 shadow-sm transition-all animate-pulse"
                        title="Bayar pesanan sekarang"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Bayar</span>
                      </button>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="p-1 rounded-lg text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Kosongkan keranjang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Dine In vs Takeaway Toggle */}
              <div className={`grid grid-cols-2 gap-1 p-1 rounded-xl border ${
                isDark ? 'bg-stone-900 border-stone-850' : 'bg-stone-100 border-stone-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'dine_in'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Utensils className="w-3 h-3" />
                  <span>Dine-In (Meja)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'takeaway'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Takeaway</span>
                </button>
              </div>

              {/* Table Selector & Customer Name */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {orderType === 'dine_in' ? (
                  <div>
                    <label className={`text-[10px] block mb-0.5 font-bold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Nomor Meja
                    </label>
                    <select
                      value={selectedTableNumber}
                      onChange={e => setSelectedTableNumber(e.target.value)}
                      className={`w-full px-2 py-1 rounded-xl text-xs font-bold text-amber-500 border focus:outline-none focus:border-amber-500 ${
                        isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      {tables.map(tbl => (
                        <option key={tbl.id} value={tbl.number}>
                          Meja {tbl.number} ({tbl.zone} {tbl.status === 'occupied' ? '• Terisi' : ''})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className={`text-[10px] block mb-0.5 font-bold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      Layanan
                    </label>
                    <div className={`px-2 py-1 rounded-xl text-xs font-bold border ${
                      isDark ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}>
                      Takeaway (Bungkus)
                    </div>
                  </div>
                )}

                <div>
                  <label className={`text-[10px] block mb-0.5 font-bold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Nama Tamu (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Pelanggan..."
                    className={`w-full px-2 py-1 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Cart Items List (High Visibility & Padded Cards) */}
            <div className={`flex-1 min-h-0 overflow-y-auto p-3 space-y-2 ${
              isDark ? 'divide-stone-850' : 'divide-stone-100'
            }`}>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-60">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-stone-800/40 text-stone-500' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <Coffee className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold">Keranjang masih kosong</p>
                  <p className="text-[11px] max-w-[200px]">
                    Pilih menu di katalog untuk menambahkan pesanan ke daftar tagihan.
                  </p>
                </div>
              ) : (
                cart.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-2.5 rounded-2xl border transition-all ${
                      isDark 
                        ? 'bg-stone-950/70 border-stone-800 hover:border-amber-500/40' 
                        : 'bg-stone-50 border-stone-200 hover:border-amber-500/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black truncate">{item.menuItem.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-black text-amber-500">
                            Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] opacity-60 font-mono">
                              (@Rp {item.unitPrice.toLocaleString('id-ID')})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className={`flex items-center gap-1 border rounded-xl p-0.5 shadow-xs ${
                        isDark ? 'bg-stone-900 border-stone-750' : 'bg-white border-stone-300'
                      }`}>
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className={`p-1 rounded-lg ${isDark ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className={`p-1 rounded-lg ${isDark ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Options Pills */}
                    {(item.selectedOptions.temperature || (item.selectedOptions.extras && item.selectedOptions.extras.length > 0) || item.selectedOptions.notes) && (
                      <div className={`mt-1.5 text-[10px] p-1.5 rounded-lg border ${
                        isDark ? 'bg-stone-900/90 border-stone-800 text-stone-300' : 'bg-white border-stone-200 text-stone-700'
                      }`}>
                        {item.selectedOptions.temperature && (
                          <span className="mr-2">• {item.selectedOptions.temperature} / {item.selectedOptions.sugar || 'Normal'}</span>
                        )}
                        {(item.selectedOptions.extras || []).map((ext, idx) => (
                          <span key={idx} className="mr-2 text-amber-500 font-bold">+ {ext.name}</span>
                        ))}
                        {item.selectedOptions.notes && (
                          <span className="block italic text-amber-400 opacity-90 mt-0.5">"{item.selectedOptions.notes}"</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

        {/* Promo Code, Notes & Checkout Footer (Pinned Shrink-0 at Bottom) */}
        <div className={`p-3 border-t shrink-0 sticky bottom-0 z-20 space-y-2 shadow-2xl ${
          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
        }`}>
          {/* Promo code toggle */}
          <div>
            {!showPromoInput && discountAmount === 0 ? (
              <button
                type="button"
                onClick={() => setShowPromoInput(true)}
                className="text-[11px] text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 transition-colors"
              >
                <Tag className="w-3 h-3" />
                <span>+ Punya Kode Promo?</span>
              </button>
            ) : (
              <div className="space-y-1">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Kode Promo (SENJA10)"
                    className={`flex-1 px-2.5 py-1 rounded-xl text-xs uppercase border focus:outline-none focus:border-amber-500 ${
                      isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-stone-300 text-stone-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    className={`px-2.5 py-1 font-bold text-xs rounded-xl border transition-colors ${
                      isDark ? 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300 shadow-sm'
                    }`}
                  >
                    Terapkan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPromoInput(false)}
                    className="px-1.5 text-xs text-stone-500 hover:text-stone-300"
                    title="Tutup promo"
                  >
                    ✕
                  </button>
                </div>
                {/* Quick Promo Presets */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] opacity-60">Coba:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPromo('SENJA10')}
                    className="text-[10px] text-amber-500 hover:underline font-mono font-bold"
                  >
                    SENJA10 (-10%)
                  </button>
                  <span className="opacity-40">•</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPromo('HAPPYHOUR')}
                    className="text-[10px] text-amber-500 hover:underline font-mono font-bold"
                  >
                    HAPPYHOUR (-15%)
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-[11px] font-bold ${promoMessage.isError ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Subtotal & Tax Breakdown */}
          <div className={`space-y-0.5 text-xs pt-1 border-t ${
            isDark ? 'border-stone-850 text-stone-400' : 'border-stone-200 text-stone-600'
          }`}>
            <div className="flex justify-between items-center text-[11px]">
              <span>Subtotal (PB1 10%):</span>
              <span className="font-semibold text-stone-300">
                Rp {subtotalAmount.toLocaleString('id-ID')} + Rp {taxAmount.toLocaleString('id-ID')}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-500 font-bold text-[11px]">
                <span>Diskon ({discountCode}):</span>
                <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className={`pt-1 border-t flex justify-between items-center text-sm font-black ${
              isDark ? 'border-stone-800 text-stone-100' : 'border-stone-200 text-stone-900'
            }`}>
              <span className="text-xs uppercase tracking-wider opacity-80">Total Tagihan:</span>
              <span className="text-lg font-black text-amber-500">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Action Buttons: Lihat Rincian + Bayar */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsCartDetailOpen(true)}
              className={`py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
                isDark ? 'bg-stone-900 hover:bg-stone-850 text-stone-200 border-stone-800' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
              }`}
              title="Lihat rincian lengkap pesanan di pop-up besar"
            >
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>Rincian</span>
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex-1 py-2.5 px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-black rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-between transition-all active:scale-[0.99] text-xs sm:text-sm cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-black">
                <Banknote className="w-4 h-4" />
                <span>Bayar Sekarang</span>
              </div>
              <div className="flex items-center gap-1 font-black">
                <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Floating Bottom Cart Bar (For quick viewing on tablets & small screens) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-stone-900/95 backdrop-blur-md border border-amber-500/50 p-2.5 rounded-2xl shadow-2xl flex items-center justify-between text-stone-100 animate-in slide-in-from-bottom duration-200">
          <div 
            onClick={() => setIsCartDetailOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center shrink-0 text-sm">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </div>
            <div className="truncate">
              <span className="text-[10px] text-stone-400 block">Total Pesanan ({cart.length} jenis)</span>
              <span className="font-black text-amber-400 text-sm">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCartDetailOpen(true)}
              className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>Rincian</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="py-1.5 px-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 shadow flex items-center gap-1"
            >
              <span>Bayar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      <ItemCustomizeModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onConfirm={handleCustomizedConfirm}
      />

      {/* Payment Modal for POS Cart */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* Cart Detail Modal (High-contrast full-screen view of order) */}
      <CartDetailModal
        isOpen={isCartDetailOpen}
        onClose={() => setIsCartDetailOpen(false)}
        onProceedToPayment={() => {
          setIsCartDetailOpen(false);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* Order Detail Modal (High-contrast view of active ticket from queue) */}
      {selectedDetailOrder && (
        <OrderDetailModal
          order={selectedDetailOrder}
          isOpen={Boolean(selectedDetailOrder)}
          onClose={() => setSelectedDetailOrder(null)}
          onPayCashier={(ord) => {
            setSelectedDetailOrder(null);
            setTablePaymentOrder(ord);
          }}
        />
      )}

      {/* Table Settle Payment Modal */}
      {tablePaymentOrder && (
        <TablePaymentModal
          table={tables.find(t => t.number === tablePaymentOrder.tableNumber) || null}
          order={tablePaymentOrder}
          isOpen={Boolean(tablePaymentOrder)}
          onClose={() => setTablePaymentOrder(null)}
        />
      )}
    </div>
  );
};
