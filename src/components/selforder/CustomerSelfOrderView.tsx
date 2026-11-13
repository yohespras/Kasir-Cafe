import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  Coffee, 
  ShoppingBag, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  Utensils, 
  Clock, 
  QrCode,
  Flame,
  Banknote,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MenuItem, SelectedOptions, CartItem, PaymentMethod } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';
import { ItemCustomizeModal } from '../modals/ItemCustomizeModal';

type SelfOrderScreen = 'menu' | 'cart' | 'payment' | 'status';

export const CustomerSelfOrderView: React.FC = () => {
  const { 
    menuItems, 
    createDirectOrder, 
    tables, 
    targetSelfOrderTable,
    cafeSettings
  } = useCafe();

  const [customerTable, setCustomerTable] = useState<string>(targetSelfOrderTable || '01');
  const [customerNameInput, setCustomerNameInput] = useState<string>('Dina');
  const [selfCart, setSelfCart] = useState<CartItem[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [activeScreen, setActiveScreen] = useState<SelfOrderScreen>('menu');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('qris');
  const [submittedOrderNum, setSubmittedOrderNum] = useState<string | null>(null);
  const [qrisDataUrl, setQrisDataUrl] = useState<string>('');

  // Sync when targetSelfOrderTable updates from table management
  useEffect(() => {
    if (targetSelfOrderTable) {
      setCustomerTable(targetSelfOrderTable);
    }
  }, [targetSelfOrderTable]);

  const subtotal = selfCart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = cafeSettings.taxEnabled ? Math.round(subtotal * (cafeSettings.taxRate / 100)) : 0;
  const serviceCharge = cafeSettings.serviceChargeEnabled ? Math.round(subtotal * (cafeSettings.serviceChargeRate / 100)) : 0;
  const total = subtotal + tax + serviceCharge;

  // Generate dynamic QRIS for mobile screen
  useEffect(() => {
    if (total > 0) {
      const qrisPayload = `00020101021226${cafeSettings.qrisNmid || 'ID1020039201'}52045812530336054${total}5802ID59${encodeURIComponent(cafeSettings.qrisMerchantName || 'Kopi Senja Specialty')}6007Jakarta6304`;
      QRCode.toDataURL(qrisPayload, {
        width: 220,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      }).then(url => setQrisDataUrl(url)).catch(err => console.error(err));
    }
  }, [total, cafeSettings]);

  const handleAdd = (item: MenuItem, options: SelectedOptions = {}) => {
    const extraTotal = (options.extras || []).reduce((acc, curr) => acc + curr.price, 0);
    const unitPrice = item.price + extraTotal;

    const existingIndex = selfCart.findIndex(c => 
      c.menuItem.id === item.id &&
      c.selectedOptions.temperature === options.temperature &&
      c.selectedOptions.sugar === options.sugar
    );

    if (existingIndex > -1) {
      const updated = [...selfCart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setSelfCart(updated);
    } else {
      setSelfCart(prev => [
        ...prev,
        {
          id: `self-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          menuItem: item,
          quantity: 1,
          selectedOptions: options,
          unitPrice,
          totalPrice: unitPrice
        }
      ]);
    }
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setSelfCart(prev => 
      prev
        .map(i => {
          if (i.id === cartItemId) {
            const newQty = i.quantity + delta;
            if (newQty <= 0) return null;
            return { ...i, quantity: newQty, totalPrice: newQty * i.unitPrice };
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleSubmitCustomerOrder = (method: PaymentMethod) => {
    if (selfCart.length === 0) return;

    try {
      const newOrder = createDirectOrder({
        tableNumber: customerTable,
        type: 'dine_in',
        customerName: customerNameInput.trim() || `Tamu Meja ${customerTable}`,
        items: selfCart,
        subtotal,
        tax,
        serviceCharge,
        totalAmount: total,
        paymentMethod: method,
        amountPaid: total
      });

      setSubmittedOrderNum(newOrder.orderNumber);
      setActiveScreen('status');
      setSelfCart([]);

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (err) {
      console.error('Customer self order error', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 lg:p-6 overflow-y-auto bg-stone-950 text-stone-100">
      {/* Simulation Banner */}
      <div className="w-full max-w-md mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-300">
          <Smartphone className="w-4 h-4" />
          <span>Mode Simulasi: QR Scan Menu Meja Pelanggan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-stone-400">Pilih Meja:</span>
          <select
            value={customerTable}
            onChange={e => setCustomerTable(e.target.value)}
            className="px-2 py-1 bg-stone-900 border border-amber-500/40 rounded-lg text-amber-300 font-bold outline-none cursor-pointer"
          >
            {tables.map(t => (
              <option key={t.id} value={t.number}>
                Meja {t.number} ({t.zone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Smartphone Mockup Frame */}
      <div className="w-full max-w-sm bg-stone-900 border-4 border-stone-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[750px] relative select-none">
        {/* Phone Notch & Status bar */}
        <div className="bg-stone-950 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-850">
          <span>09:41</span>
          <div className="w-20 h-4 bg-stone-900 rounded-full" />
          <span className="flex items-center gap-1">5G 100%</span>
        </div>

        {/* Cafe Self-Order Header */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
              <Coffee className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-stone-100 uppercase tracking-tight">
                {cafeSettings.receiptCafeName || 'KOPI SENJA'}
              </h3>
              <p className="text-[10px] text-amber-400 font-bold">Menu Meja {customerTable}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveScreen(activeScreen === 'cart' || activeScreen === 'payment' ? 'menu' : 'cart')}
            className="relative p-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            {selfCart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-bold rounded-full text-[9px] flex items-center justify-center">
                {selfCart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Phone Content Screen */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SCREEN 1: MENU */}
          {activeScreen === 'menu' && (
            <>
              {/* Banner Welcome */}
              <div className="p-3.5 bg-gradient-to-br from-amber-950/60 to-stone-900 border border-amber-500/25 rounded-2xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                  Selamat Datang di Meja {customerTable}
                </span>
                <h4 className="font-black text-sm text-stone-100 mt-0.5">Pesan Langsung dari Meja</h4>
                <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                  Pilih menu favorit, atur rasa & es, lalu bayar via <strong>QRIS</strong> atau <strong>Tunai di kasir</strong>. Pesanan langsung diantar ke meja Anda!
                </p>
              </div>

              {/* Menu items list */}
              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Daftar Menu Kafe
                </h5>

                {menuItems.slice(0, 8).map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.options?.iceOptions?.length || item.options?.sugarOptions?.length) {
                        setCustomizingItem(item);
                      } else {
                        handleAdd(item);
                      }
                    }}
                    className="p-2.5 bg-stone-950 border border-stone-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-amber-500/40 transition-all active:scale-[0.99]"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h6 className="font-bold text-xs text-stone-200 truncate">{item.name}</h6>
                        {item.badge && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 bg-amber-500 text-stone-950 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{item.description}</p>
                      <p className="text-xs font-bold text-amber-400 mt-1">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SCREEN 2: CART */}
          {activeScreen === 'cart' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <button
                  onClick={() => setActiveScreen('menu')}
                  className="text-xs text-amber-400 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Tambah Menu Lain
                </button>
                <span className="text-xs font-bold text-stone-300">
                  Keranjang ({selfCart.length})
                </span>
              </div>

              {selfCart.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-xs">
                  Keranjang masih kosong. Silakan pilih menu terlebih dahulu.
                </div>
              ) : (
                <div className="space-y-3">
                  {selfCart.map(item => (
                    <div key={item.id} className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-stone-200">{item.menuItem.name}</p>
                          <span className="text-xs font-semibold text-amber-400">
                            Rp {item.unitPrice.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-stone-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-stone-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {item.selectedOptions.temperature && (
                        <p className="text-[10px] text-stone-400">
                          • {item.selectedOptions.temperature} / {item.selectedOptions.sugar || 'Normal'}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-1.5 text-xs text-stone-400">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between">
                        <span>PB1 Resto ({cafeSettings.taxRate}%):</span>
                        <span>Rp {tax.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {serviceCharge > 0 && (
                      <div className="flex justify-between">
                        <span>Layanan ({cafeSettings.serviceChargeRate}%):</span>
                        <span>Rp {serviceCharge.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="border-t border-stone-800 pt-1.5 flex justify-between font-bold text-stone-100 text-sm">
                      <span>Total Tagihan:</span>
                      <span className="text-amber-400">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Nama Pemesan (Untuk panggilan antar)</label>
                    <input
                      type="text"
                      value={customerNameInput}
                      onChange={e => setCustomerNameInput(e.target.value)}
                      placeholder="Masukkan nama Anda..."
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Move to Payment Step */}
                  <button
                    onClick={() => setActiveScreen('payment')}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Lanjut ke Pembayaran (Rp {total.toLocaleString('id-ID')}) →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: PAYMENT (QRIS / TUNAI) */}
          {activeScreen === 'payment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <button
                  onClick={() => setActiveScreen('cart')}
                  className="text-xs text-amber-400 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Keranjang
                </button>
                <span className="text-xs font-bold text-stone-300">
                  Pembayaran
                </span>
              </div>

              {/* Total Banner */}
              <div className="p-3 bg-stone-950 border border-amber-500/30 rounded-2xl text-center">
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Total Tagihan Meja {customerTable}</span>
                <p className="text-2xl font-black text-amber-400 mt-0.5">
                  Rp {total.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-stone-500">Atas nama: {customerNameInput}</p>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-2">
                  Pilih Cara Pembayaran:
                </label>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* QRIS Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPaymentMethod === 'qris'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/40'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mb-1 text-amber-400" />
                    <span className="font-extrabold text-xs block text-stone-100">📱 QRIS</span>
                    <span className="text-[9px] opacity-75">Scan langsung</span>
                  </button>

                  {/* Tunai (Cash) Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPaymentMethod === 'cash'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/40'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mb-1 text-amber-400" />
                    <span className="font-extrabold text-xs block text-stone-100">💵 TUNAI</span>
                    <span className="text-[9px] opacity-75">Bayar di kasir</span>
                  </button>
                </div>
              </div>

              {/* QRIS Dynamic Flow */}
              {selectedPaymentMethod === 'qris' && (
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl text-center space-y-2.5 animate-in fade-in">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                      QRIS Dinamis Otomatis
                    </span>
                    <p className="text-[10px] text-stone-400">
                      {cafeSettings.qrisMerchantName || 'Kopi Senja Specialty'}
                    </p>
                  </div>

                  <div className="p-2 bg-white rounded-xl inline-block shadow-sm">
                    {qrisDataUrl ? (
                      <img src={qrisDataUrl} alt="QRIS Code" className="w-36 h-36 mx-auto object-contain" />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-xs text-stone-400">
                        Membuat QRIS...
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-stone-400 px-2 leading-relaxed">
                    Scan menggunakan BCA Mobile, GoPay, OVO, ShopeePay, atau aplikasi QRIS apa saja.
                  </p>

                  <button
                    type="button"
                    onClick={() => handleSubmitCustomerOrder('qris')}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    ✓ Saya Sudah Bayar QRIS & Kirim ke Dapur
                  </button>
                </div>
              )}

              {/* Tunai Flow */}
              {selectedPaymentMethod === 'cash' && (
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Banknote className="w-4 h-4" />
                    <span>Bayar Tunai di Kasir</span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Pesanan Anda akan langsung dikirim ke antrean barista & dapur sekarang. Silakan datang ke meja kasir untuk membayar tunai sejumlah:
                  </p>

                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-center">
                    <span className="text-[10px] text-stone-400">Nominal yang Harus Dibayar:</span>
                    <p className="text-lg font-black text-amber-400">
                      Rp {total.toLocaleString('id-ID')}
                    </p>
                    <span className="text-[10px] text-stone-400">Sebutkan <strong>Meja {customerTable}</strong> di kasir</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubmitCustomerOrder('cash')}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Kirim Pesanan ke Dapur & Bayar Tunai di Kasir
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 4: STATUS */}
          {activeScreen === 'status' && (
            <div className="py-6 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-amber-400">Pesanan Diterima!</span>
                <h4 className="text-xl font-black text-stone-100">No. #{submittedOrderNum}</h4>
                <p className="text-xs text-stone-400 mt-1">Meja {customerTable} • Atas Nama {customerNameInput}</p>
                <div className="mt-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    selectedPaymentMethod === 'qris'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}>
                    {selectedPaymentMethod === 'qris' ? '✓ QRIS Terverifikasi' : '💵 Bayar Tunai di Kasir'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Sedang Disiapkan oleh Barista & Dapur</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Pesanan Anda sudah masuk di antrean Kitchen Display System (KDS). Barista dan kru dapur sedang menyiapkan hidangan segar untuk diantar langsung ke Meja {customerTable}.
                </p>
              </div>

              <button
                onClick={() => setActiveScreen('menu')}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Pesan Menu Tambahan
              </button>
            </div>
          )}
        </div>

        {/* Phone Bottom Bar */}
        {activeScreen === 'menu' && selfCart.length > 0 && (
          <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-stone-500">{selfCart.reduce((s, i) => s + i.quantity, 0)} item dipilih</p>
              <p className="text-xs font-bold text-amber-400">Rp {total.toLocaleString('id-ID')}</p>
            </div>
            <button
              onClick={() => setActiveScreen('cart')}
              className="py-2 px-4 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              Lihat Tagihan →
            </button>
          </div>
        )}
      </div>

      {/* Customization Modal */}
      <ItemCustomizeModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onConfirm={(item, options, qty) => {
          for (let i = 0; i < qty; i++) {
            handleAdd(item, options);
          }
        }}
      />
    </div>
  );
};
