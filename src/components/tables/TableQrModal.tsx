import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  X, 
  Printer, 
  Download, 
  Smartphone, 
  Wifi, 
  Key, 
  Coffee, 
  Sparkles, 
  Check, 
  Layers,
  ArrowRight,
  Plus,
  Minus,
  Banknote,
  QrCode,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { CafeTable, CartItem, MenuItem, PaymentMethod } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';

interface TableQrModalProps {
  table: CafeTable | null;
  allTables?: CafeTable[];
  isBatchMode?: boolean;
  onClose: () => void;
}

export const TableQrModal: React.FC<TableQrModalProps> = ({ 
  table, 
  allTables = [], 
  isBatchMode = false, 
  onClose 
}) => {
  const { 
    cafeSettings, 
    openSelfOrderForTable, 
    menuItems, 
    createDirectOrder, 
    theme 
  } = useCafe();

  const [activeModalTab, setActiveModalTab] = useState<'standee' | 'simulate'>('standee');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [allQrUrls, setAllQrUrls] = useState<Record<string, string>>({});
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // In-modal simulation states
  const [simCart, setSimCart] = useState<CartItem[]>([]);
  const [simPaymentMethod, setSimPaymentMethod] = useState<PaymentMethod>('qris');
  const [simCustomerName, setSimCustomerName] = useState<string>('Dina');
  const [simSuccessOrderNum, setSimSuccessOrderNum] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Generate QR code for single table or all tables
  useEffect(() => {
    if (isBatchMode && allTables.length > 0) {
      const urls: Record<string, string> = {};
      const generateAll = async () => {
        for (const tbl of allTables) {
          const orderUrl = `${window.location.origin}/?table=${tbl.number}&mode=selforder`;
          try {
            const url = await QRCode.toDataURL(orderUrl, {
              width: 280,
              margin: 1,
              color: {
                dark: '#1c1917',
                light: '#ffffff'
              }
            });
            urls[tbl.number] = url;
          } catch (e) {
            console.error('QR generate error for table', tbl.number, e);
          }
        }
        setAllQrUrls(urls);
      };
      generateAll();
    } else if (table) {
      const orderUrl = `${window.location.origin}/?table=${table.number}&mode=selforder`;
      QRCode.toDataURL(orderUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('QR generate error', err);
      });
    }
  }, [table, allTables, isBatchMode]);

  if (!table && !isBatchMode) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !table) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Meja-${table.number}-${cafeSettings.receiptCafeName || 'KopiSenja'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleOpenSelfOrderFullScreen = (tableNum: string) => {
    openSelfOrderForTable(tableNum);
    onClose();
  };

  // In-modal simulation cart helpers
  const handleSimAddToCart = (item: MenuItem) => {
    const existing = simCart.find(c => c.menuItem.id === item.id);
    if (existing) {
      setSimCart(prev =>
        prev.map(c =>
          c.menuItem.id === item.id
            ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * c.unitPrice }
            : c
        )
      );
    } else {
      setSimCart(prev => [
        ...prev,
        {
          id: `sim-${Date.now()}-${item.id}`,
          menuItem: item,
          quantity: 1,
          selectedOptions: { temperature: 'Ice', sugar: 'Normal' },
          unitPrice: item.price,
          totalPrice: item.price
        }
      ]);
    }
  };

  const handleSimUpdateQty = (itemId: string, delta: number) => {
    setSimCart(prev =>
      prev
        .map(c => {
          if (c.id === itemId) {
            const nextQty = c.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...c, quantity: nextQty, totalPrice: nextQty * c.unitPrice };
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const simSubtotal = simCart.reduce((s, i) => s + i.totalPrice, 0);
  const simTax = cafeSettings.taxEnabled ? Math.round(simSubtotal * (cafeSettings.taxRate / 100)) : 0;
  const simTotal = simSubtotal + simTax;

  const handleSimSubmitOrder = () => {
    if (!table || simCart.length === 0) return;

    try {
      const newOrder = createDirectOrder({
        tableNumber: table.number,
        type: 'dine_in',
        customerName: simCustomerName.trim() || `Tamu Meja ${table.number}`,
        items: simCart,
        subtotal: simSubtotal,
        tax: simTax,
        serviceCharge: 0,
        totalAmount: simTotal,
        paymentMethod: simPaymentMethod,
        amountPaid: simTotal
      });

      setSimSuccessOrderNum(newOrder.orderNumber);
      setSimCart([]);

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (err) {
      console.error('Simulate order error', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full ${isBatchMode ? 'max-w-4xl' : 'max-w-xl'} max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
        isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Modal Top Header (Non-printable) */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 ${
          isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Coffee className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
                  {isBatchMode ? 'Cetak Semua Meja' : `Meja ${table?.number}`}
                </span>
                <span className="text-xs text-stone-400">
                  {isBatchMode ? `${allTables.length} Kartu Standee` : `Zona ${table?.zone}`}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5">
                {isBatchMode ? 'Cetak Seluruh Standee QR Meja Kafe' : `QR Code & Pemesanan Meja ${table?.number}`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher for Single Table: Standee vs In-Modal Simulator */}
        {!isBatchMode && table && (
          <div className={`flex border-b flex-shrink-0 ${isDark ? 'border-stone-800 bg-stone-950/60' : 'border-stone-200 bg-stone-100'}`}>
            <button
              type="button"
              onClick={() => setActiveModalTab('standee')}
              className={`flex-1 py-3 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeModalTab === 'standee'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span>1. Kartu Standee QR Meja</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModalTab('simulate')}
              className={`flex-1 py-3 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeModalTab === 'simulate'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>2. Simulasi Pesan di Meja Ini</span>
            </button>
          </div>
        )}

        {/* Modal Body / Printable Tent Card Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Standee Tent Card */}
          {!isBatchMode && table && activeModalTab === 'standee' && (
            <div className="flex flex-col items-center">
              {/* Standee Tent Card Mockup (Printable) */}
              <div 
                id="printable-single-table-qr"
                className="table-qr-printable w-full max-w-[340px] bg-white text-stone-950 p-6 rounded-3xl shadow-xl border-4 border-amber-500/30 text-center space-y-4 select-none relative"
              >
                {/* Brand Header */}
                <div className="space-y-1">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30 mb-2">
                    <Coffee className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-stone-950 leading-tight">
                    {cafeSettings.receiptCafeName || 'KOPI SENJA'}
                  </h2>
                  <p className="text-[10px] text-stone-500 font-medium">
                    {cafeSettings.tagline || 'Specialty Coffee, Eatery & Warm Conversations'}
                  </p>
                </div>

                {/* Table Number Ribbon */}
                <div className="py-2 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 rounded-2xl font-black shadow-sm">
                  <div className="text-[10px] uppercase tracking-widest font-black opacity-80">
                    NOMOR MEJA / TABLE
                  </div>
                  <div className="text-3xl font-black tracking-tight">
                    MEJA {table.number}
                  </div>
                  <div className="text-[9px] uppercase font-bold tracking-wider opacity-75">
                    Zona {table.zone} • Kapasitas {table.capacity} Orang
                  </div>
                </div>

                {/* Real High-Resolution Scannable QR Code */}
                <div className="p-3 bg-stone-50 rounded-2xl border-2 border-stone-200 inline-block shadow-inner">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt={`QR Meja ${table.number}`} 
                      className="w-48 h-48 mx-auto object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-stone-400">
                      Membuat QR...
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-1 text-stone-800">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Scan untuk Pesan & Bayar</span>
                  </p>
                  <p className="text-[10px] text-stone-500 leading-snug px-3">
                    Buka kamera ponsel Anda, scan QR di atas untuk melihat menu & bayar langsung via <strong>QRIS</strong> atau <strong>Tunai</strong> di kasir.
                  </p>
                </div>

                {/* Cafe WiFi Box */}
                <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-left text-[10px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-700">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-amber-500" /> WiFi Kafe:
                    </span>
                    <span className="font-mono text-stone-900">{cafeSettings.receiptWifiUsername || 'KopiSenja_Guest'}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-stone-700">
                    <span className="flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-500" /> Password:
                    </span>
                    <span className="font-mono text-amber-600 font-black">{cafeSettings.receiptWifiPassword || 'senjaindah'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IN-MODAL SIMULATION (HP PELANGGAN MEJA INI) */}
          {!isBatchMode && table && activeModalTab === 'simulate' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Simulasi Pelanggan Duduk di Meja {table.number}
                  </span>
                  <p className="text-stone-300 text-xs">
                    Pilih menu di bawah, atur metode bayar (QRIS / Tunai), lalu kirim pesanan untuk menguji alur langsung.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSelfOrderFullScreen(table.number)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-xs"
                >
                  <span>Buka Layar Penuh</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {simSuccessOrderNum ? (
                <div className="p-6 text-center space-y-4 bg-stone-950 border border-emerald-500/40 rounded-3xl">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase">Pesanan Meja {table.number} Berhasil Dibuat!</span>
                    <h3 className="text-xl font-black text-stone-100">No. Order #{simSuccessOrderNum}</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Status Meja {table.number} kini otomatis menjadi <strong>Terisi (Occupied)</strong> dan pesanan sudah masuk di Kitchen Display (KDS).
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setSimSuccessOrderNum(null)}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Pesan Tambahan Lagi
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black cursor-pointer shadow"
                    >
                      Lihat Meja {table.number} Sekarang
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left: Quick Menu Selector (7 cols) */}
                  <div className="md:col-span-7 space-y-2.5">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                      Pilih Menu Favorit:
                    </span>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {menuItems.slice(0, 6).map(item => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-2xl border flex items-center justify-between gap-3 bg-stone-950 border-stone-800"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                            <div className="truncate">
                              <h5 className="font-bold text-xs text-stone-200 truncate">{item.name}</h5>
                              <span className="text-[11px] font-bold text-amber-400">
                                Rp {item.price.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSimAddToCart(item)}
                            className="p-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 cursor-pointer flex-shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Cart & Submit for Table (5 cols) */}
                  <div className="md:col-span-5 p-4 rounded-2xl border bg-stone-950 border-stone-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-stone-800">
                        <span className="font-bold text-xs text-stone-300">Keranjang Meja {table.number}</span>
                        <span className="text-xs font-mono font-bold text-amber-500">{simCart.length} Menu</span>
                      </div>

                      {simCart.length === 0 ? (
                        <div className="py-6 text-center text-xs text-stone-500">
                          Pilih menu di samping untuk mulai simulasi.
                        </div>
                      ) : (
                        <div className="space-y-2 py-2 max-h-40 overflow-y-auto">
                          {simCart.map(ci => (
                            <div key={ci.id} className="flex justify-between items-center text-xs">
                              <div className="truncate pr-1">
                                <p className="font-semibold text-stone-200 truncate">{ci.menuItem.name}</p>
                                <span className="text-[10px] text-amber-400">Rp {ci.unitPrice.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleSimUpdateQty(ci.id, -1)}
                                  className="p-1 text-stone-400 hover:text-white"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-xs w-4 text-center">{ci.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleSimUpdateQty(ci.id, 1)}
                                  className="p-1 text-stone-400 hover:text-white"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-800 text-xs">
                      <div className="flex justify-between text-stone-400">
                        <span>Total:</span>
                        <span className="font-bold text-amber-400 text-sm">Rp {simTotal.toLocaleString('id-ID')}</span>
                      </div>

                      {/* Payment Method Selector */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSimPaymentMethod('qris')}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            simPaymentMethod === 'qris'
                              ? 'bg-amber-500 text-stone-950 border-amber-500'
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          📱 QRIS
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimPaymentMethod('cash')}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            simPaymentMethod === 'cash'
                              ? 'bg-amber-500 text-stone-950 border-amber-500'
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          💵 Tunai di Kasir
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={simCart.length === 0}
                        onClick={handleSimSubmitOrder}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Kirim Pesanan Meja {table.number}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Batch Mode: All Tables Grid */}
          {isBatchMode && (
            <div className="table-qr-printable grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allTables.map(tbl => (
                <div 
                  key={tbl.id} 
                  className="bg-white text-stone-950 p-4 rounded-2xl border-2 border-stone-200 text-center space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="text-left">
                      <h4 className="font-black text-xs uppercase">{cafeSettings.receiptCafeName || 'KOPI SENJA'}</h4>
                      <span className="text-[9px] text-stone-500">Zona {tbl.zone}</span>
                    </div>
                    <span className="px-2 py-1 bg-amber-500 text-stone-950 font-black text-sm rounded-lg">
                      MEJA {tbl.number}
                    </span>
                  </div>

                  {allQrUrls[tbl.number] ? (
                    <img 
                      src={allQrUrls[tbl.number]} 
                      alt={`QR Meja ${tbl.number}`} 
                      className="w-36 h-36 mx-auto object-contain rounded-lg border border-stone-100 p-1"
                    />
                  ) : (
                    <div className="w-36 h-36 mx-auto flex items-center justify-center text-xs text-stone-400">
                      Loading...
                    </div>
                  )}

                  <div className="text-[9px] font-bold text-amber-700 uppercase">
                    Scan untuk Pesan & Bayar
                  </div>

                  <div className="p-1.5 rounded-lg bg-stone-100 text-[9px] text-left text-stone-700 space-y-0.5">
                    <div className="flex justify-between">
                      <span>WiFi:</span>
                      <span className="font-mono font-bold">{cafeSettings.receiptWifiUsername || 'KopiSenja_Guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pass:</span>
                      <span className="font-mono font-bold text-amber-600">{cafeSettings.receiptWifiPassword || 'senjaindah'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSelfOrderFullScreen(tbl.number)}
                    className="w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 text-[10px] font-bold rounded-lg print:hidden transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Simulasi Pesan Meja Ini</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Non-printable) */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 ${
          isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          {!isBatchMode && table && (
            <button
              type="button"
              onClick={() => handleOpenSelfOrderFullScreen(table.number)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-stone-900 border-amber-500/40 text-amber-400 hover:bg-amber-500/10' 
                  : 'bg-white border-amber-400 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Buka Layar Penuh Self-Order Meja {table.number}</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isBatchMode && (
              <button
                type="button"
                onClick={handleDownloadQr}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark ? 'bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-800' : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
                }`}
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Tersimpan</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Unduh PNG</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isBatchMode ? 'Cetak Semua Standee' : 'Cetak Standee Meja'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
