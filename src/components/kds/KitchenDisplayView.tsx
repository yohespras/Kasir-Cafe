import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Coffee, 
  Clock, 
  CheckCircle, 
  BellRing, 
  Flame, 
  AlertTriangle, 
  Play, 
  CheckCheck 
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import { soundFx } from '../../services/soundEffects';

export const KitchenDisplayView: React.FC = () => {
  const { orders, updateOrderStatus, soundEnabled, theme, activeStaff } = useCafe();
  const [stationFilter, setStationFilter] = useState<'all' | 'barista' | 'kitchen'>(() => {
    if (activeStaff?.role === 'barista') return 'barista';
    if (activeStaff?.role === 'kitchen') return 'kitchen';
    return 'all';
  });
  const [now, setNow] = useState(Date.now());

  const isDark = theme === 'dark';

  // Update elapsed timer tick every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter active tickets (pending, preparing, ready)
  const activeOrders = orders.filter(
    o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  );

  const getStationItems = (order: Order) => {
    if (stationFilter === 'all') return order.items;
    if (stationFilter === 'barista') {
      return order.items.filter(
        i => i.menuItem.category === 'coffee' || i.menuItem.category === 'signature' || i.menuItem.category === 'manual_brew' || i.menuItem.category === 'non_coffee'
      );
    }
    // Kitchen (food, snack, dessert)
    return order.items.filter(
      i => i.menuItem.category === 'food' || i.menuItem.category === 'snack' || i.menuItem.category === 'dessert'
    );
  };

  const getElapsedMinutes = (timestamp: string) => {
    const orderTime = new Date(timestamp).getTime();
    const diffMs = Math.max(0, now - orderTime);
    return Math.floor(diffMs / 60000);
  };

  const getUrgencyBadge = (minutes: number) => {
    if (minutes < 5) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Clock className="w-3 h-3" /> {minutes} mnt lalu
        </span>
      );
    } else if (minutes < 10) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
          <Clock className="w-3 h-3" /> {minutes} mnt lalu
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/40 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> {minutes} mnt (Prioritas!)
        </span>
      );
    }
  };

  return (
    <div className={`flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto space-y-6 transition-colors ${
      isDark ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f2] text-stone-900'
    }`}>
      {/* Top Bar with Station Filters and Sound Ding */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
        isDark ? 'border-stone-850' : 'border-stone-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black">Kitchen Display System (KDS)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500">
              {activeOrders.length} Antrean
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Tampilan antrean langsung barista & dapur secara real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Station Filters */}
          <div className={`flex items-center p-1 rounded-2xl border ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <button
              onClick={() => setStationFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stationFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Semua Menu
            </button>
            <button
              onClick={() => setStationFilter('barista')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stationFilter === 'barista'
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Barista (Minuman)
            </button>
            <button
              onClick={() => setStationFilter('kitchen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stationFilter === 'kitchen'
                  ? 'bg-amber-500 text-stone-950 font-black'
                  : isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Dapur (Makanan)
            </button>
          </div>

          <button
            onClick={() => soundFx.playKitchenBell()}
            className={`p-2.5 rounded-xl border text-amber-500 transition-colors ${
              isDark ? 'bg-stone-900 hover:bg-stone-850 border-stone-800' : 'bg-white hover:bg-stone-100 border-stone-200 shadow-sm'
            }`}
            title="Bunyikan Bel Dapur (Test Bell)"
          >
            <BellRing className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Tickets Grid */}
      {activeOrders.length === 0 ? (
        <div className={`py-20 flex flex-col items-center justify-center text-center space-y-3 ${
          isDark ? 'text-stone-500' : 'text-stone-400'
        }`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-emerald-500 border ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <CheckCheck className="w-8 h-8" />
          </div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
            Semua Pesanan Telah Disiapkan!
          </h3>
          <p className="text-xs max-w-sm">
            Tidak ada tiket pesanan baru yang sedang menunggu di antrean barista maupun dapur saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {activeOrders.map(order => {
            const items = getStationItems(order);
            if (items.length === 0) return null;

            const elapsed = getElapsedMinutes(order.timestamp);
            const isReady = order.status === 'ready';
            const isPreparing = order.status === 'preparing';

            return (
              <div
                key={order.id}
                className={`flex flex-col justify-between rounded-3xl border shadow-lg overflow-hidden transition-all ${
                  isReady
                    ? isDark ? 'bg-gradient-to-b from-stone-900 to-emerald-950/20 border-emerald-500/50' : 'bg-emerald-50/70 border-emerald-300'
                    : isPreparing
                    ? isDark ? 'bg-stone-900 border-amber-500/40' : 'bg-amber-50/70 border-amber-300'
                    : isDark ? 'bg-stone-900 border-stone-850' : 'bg-white border-stone-200'
                }`}
              >
                {/* Ticket Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-amber-500 font-mono">
                      #{order.orderNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      order.type === 'dine_in'
                        ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                    }`}>
                      {order.type === 'dine_in' ? `MEJA ${order.tableNumber}` : 'TAKEAWAY'}
                    </span>
                  </div>

                  {getUrgencyBadge(elapsed)}
                </div>

                {/* Customer Meta */}
                <div className={`px-4 py-2 border-b flex items-center justify-between text-xs ${
                  isDark ? 'bg-stone-900/60 border-stone-850 text-stone-400' : 'bg-stone-50/60 border-stone-100 text-stone-500'
                }`}>
                  <span className="truncate max-w-[150px]">
                    Tamu: <strong className={isDark ? 'text-stone-200' : 'text-stone-800'}>{order.customerName}</strong>
                  </span>
                  <span>Kasir: {order.cashierName}</span>
                </div>

                {/* Items List */}
                <div className={`p-4 space-y-3 flex-1 overflow-y-auto max-h-72 divide-y ${
                  isDark ? 'divide-stone-850' : 'divide-stone-100'
                }`}>
                  {items.map(item => (
                    <div key={item.id} className="pt-2 first:pt-0">
                      <div className="flex items-start gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black text-sm flex items-center justify-center flex-shrink-0">
                          {item.quantity}x
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-tight">
                            {item.menuItem.name}
                          </h4>
                          
                          {/* Modifiers */}
                          <div className={`text-xs space-y-0.5 mt-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                            {item.selectedOptions.temperature && (
                              <p className="text-amber-500 font-semibold">
                                • {item.selectedOptions.temperature} / {item.selectedOptions.sugar || 'Normal'}
                              </p>
                            )}
                            {(item.selectedOptions.extras || []).map((e, idx) => (
                              <p key={idx}>+ {e.name}</p>
                            ))}
                            {item.selectedOptions.notes && (
                              <p className={`italic px-2 py-0.5 rounded border mt-1 ${
                                isDark ? 'bg-amber-950/30 border-amber-800/30 text-amber-300' : 'bg-amber-100 border-amber-200 text-amber-800'
                              }`}>
                                Note: {item.selectedOptions.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Advancement Button */}
                <div className={`p-4 border-t ${
                  isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
                }`}>
                  {order.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Mulai Masak / Siapkan Minuman</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>Pesanan Siap (Bunyikan Bel)</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                        isDark 
                          ? 'bg-stone-800 hover:bg-stone-750 text-emerald-400 border-emerald-500/30' 
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Tandai Selesai Diantar ke Meja</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
