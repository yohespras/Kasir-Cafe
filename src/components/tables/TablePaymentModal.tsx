import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Coffee, 
  Printer, 
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { CafeTable, Order, PaymentMethod } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';

interface TablePaymentModalProps {
  table: CafeTable | null;
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TablePaymentModal: React.FC<TablePaymentModalProps> = ({
  table,
  order,
  isOpen,
  onClose
}) => {
  const { settleTableOrder, cafeSettings, theme } = useCafe();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(order?.totalAmount || 0);
  const [customCashInput, setCustomCashInput] = useState<string>((order?.totalAmount || 0).toString());
  const [qrisQrUrl, setQrisQrUrl] = useState<string>('');
  const [qrisVerified, setQrisVerified] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const isDark = theme === 'dark';
  const totalAmount = order?.totalAmount || 0;

  // Sync cash given when order changes
  useEffect(() => {
    if (order) {
      setCashGiven(order.totalAmount);
      setCustomCashInput(order.totalAmount.toString());
      setQrisVerified(false);

      // Generate dynamic QRIS string/URL
      const qrisPayload = `00020101021226${cafeSettings.qrisNmid || 'ID1020039201'}52045812530336054${order.totalAmount}5802ID59${encodeURIComponent(cafeSettings.qrisMerchantName || 'Kopi Senja Specialty')}6007Jakarta6304`;
      QRCode.toDataURL(qrisPayload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      }).then(url => setQrisQrUrl(url)).catch(err => console.error(err));
    }
  }, [order, cafeSettings]);

  if (!isOpen || !table || !order) return null;

  const cashOptions = [
    { label: 'Uang Pas', amount: totalAmount },
    { label: 'Rp 50.000', amount: 50000 },
    { label: 'Rp 100.000', amount: 100000 },
    { label: 'Rp 150.000', amount: 150000 },
    { label: 'Rp 200.000', amount: 200000 },
    { label: 'Rp 300.000', amount: 300000 }
  ].filter(opt => opt.amount >= totalAmount || opt.label === 'Uang Pas');

  const change = Math.max(0, cashGiven - totalAmount);
  const isCashInsufficient = paymentMethod === 'cash' && cashGiven < totalAmount;

  const handleCashOptionClick = (amount: number) => {
    setCashGiven(amount);
    setCustomCashInput(amount.toString());
  };

  const handleCustomCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseInt(raw, 10) || 0;
    setCustomCashInput(raw);
    setCashGiven(num);
  };

  const handleSimulateQris = () => {
    setQrisVerified(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleSubmitPayment = () => {
    if (isCashInsufficient) return;
    setIsProcessing(true);
    try {
      const paid = paymentMethod === 'cash' ? cashGiven : totalAmount;
      settleTableOrder(table.number, paymentMethod, paid);
      onClose();
    } catch (err) {
      console.error('Settle order error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
        isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Top Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 ${
          isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
                Meja {table.number} • {table.zone}
              </span>
              <span className="text-xs text-stone-400">Order #{order.orderNumber}</span>
            </div>
            <h3 className="text-lg font-black mt-0.5">Bayar Tagihan Meja {table.number}</h3>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Bill Overview Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark 
              ? 'bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/20 border-amber-500/30'
              : 'bg-amber-50/80 border-amber-200 text-stone-900'
          }`}>
            <div>
              <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Total Tagihan Meja {table.number}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-500">
                Rp {totalAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Pemesan: <strong>{order.customerName}</strong> • {order.items.length} Menu
              </p>
            </div>

            <div className={`text-xs space-y-0.5 text-right ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              <div className="flex sm:justify-end gap-3">
                <span>Subtotal:</span>
                <span className="font-bold">Rp {order.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex sm:justify-end gap-3">
                  <span>PB1 ({cafeSettings.taxRate}%):</span>
                  <span>Rp {order.tax.toLocaleString('id-ID')}</span>
                </div>
              )}
              {order.serviceCharge > 0 && (
                <div className="flex sm:justify-end gap-3">
                  <span>Layanan ({cafeSettings.serviceChargeRate}%):</span>
                  <span>Rp {order.serviceCharge.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ordered items breakdown */}
          <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
            isDark ? 'bg-stone-950/70 border-stone-850' : 'bg-stone-50 border-stone-200'
          }`}>
            <h4 className="font-bold uppercase tracking-wider text-[10px] text-amber-500">
              Rincian Pesanan Meja Ini:
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {order.items.map((ci, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-amber-400">{ci.quantity}x</span>
                    <span className="truncate">{ci.menuItem.name}</span>
                    {ci.selectedOptions.temperature && (
                      <span className="text-[10px] opacity-60">({ci.selectedOptions.temperature})</span>
                    )}
                  </div>
                  <span className="font-mono font-semibold">Rp {ci.totalPrice.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector (Tunai & QRIS Prominent) */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider block ${
              isDark ? 'text-stone-400' : 'text-stone-600'
            }`}>
              Pilih Metode Pembayaran:
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Tunai (Cash) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-500 ring-2 ring-amber-500 shadow-md'
                    : isDark
                    ? 'bg-stone-950 border-stone-850 text-stone-400 hover:bg-stone-850'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${
                  paymentMethod === 'cash' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-amber-400'
                }`}>
                  <Banknote className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className={`text-sm font-extrabold ${
                    paymentMethod === 'cash' ? (isDark ? 'text-amber-400' : 'text-amber-700') : (isDark ? 'text-stone-200' : 'text-stone-800')
                  }`}>
                    💵 TUNAI (CASH)
                  </h4>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Hitung uang tunai & kembalian
                  </p>
                </div>
              </button>

              {/* QRIS Dinamis */}
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'qris'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-500 ring-2 ring-amber-500 shadow-md'
                    : isDark
                    ? 'bg-stone-950 border-stone-850 text-stone-400 hover:bg-stone-850'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${
                  paymentMethod === 'qris' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-amber-400'
                }`}>
                  <QrCode className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className={`text-sm font-extrabold ${
                    paymentMethod === 'qris' ? (isDark ? 'text-amber-400' : 'text-amber-700') : (isDark ? 'text-stone-200' : 'text-stone-800')
                  }`}>
                    📱 QRIS DINAMIS
                  </h4>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Scan GoPay, OVO, BCA, Dana
                  </p>
                </div>
              </button>
            </div>

            {/* Debit & Transfer alternative */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('debit')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                  paymentMethod === 'debit'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold'
                    : isDark ? 'bg-stone-950 border-stone-850 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Kartu Debit / EDC</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold'
                    : isDark ? 'bg-stone-950 border-stone-850 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Transfer Bank</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT: TUNAI */}
          {paymentMethod === 'cash' && (
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 animate-in fade-in ${
              isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Perhitungan Uang Tunai
                </span>
                <span className="text-xs text-stone-400">Total: Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>

              {/* Preset quick buttons */}
              <div>
                <label className="text-[10px] text-stone-400 block mb-1.5 font-semibold">
                  Pilihan Cepat Nominal Uang:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {cashOptions.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleCashOptionClick(opt.amount)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        cashGiven === opt.amount
                          ? 'bg-amber-500 text-stone-950 border-amber-500 font-black shadow-sm'
                          : isDark
                          ? 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Cash Input */}
              <div>
                <label className="text-xs font-semibold block mb-1 text-stone-300">
                  Nominal Uang yang Diterima (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold text-sm">Rp</span>
                  <input
                    type="text"
                    value={customCashInput}
                    onChange={handleCustomCashChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-base font-black outline-none ${
                      isDark 
                        ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-500' 
                        : 'bg-white border-stone-300 text-stone-900 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              {/* Kembalian Alert / Calculation */}
              <div className={`p-3.5 rounded-xl flex items-center justify-between border ${
                isCashInsufficient
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                <div className="flex items-center gap-2">
                  {isCashInsufficient ? (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-xs font-bold">
                    {isCashInsufficient ? 'Uang Masih Kurang:' : 'Uang Kembalian Pelanggan:'}
                  </span>
                </div>
                <span className="text-base font-black font-mono">
                  Rp {Math.abs(change).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          {/* TAB CONTENT: QRIS */}
          {paymentMethod === 'qris' && (
            <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-4 animate-in fade-in ${
              isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20 inline-block">
                  QRIS Standar Nasional
                </span>
                <h4 className="font-extrabold text-sm">{cafeSettings.qrisMerchantName || 'Kopi Senja Specialty'}</h4>
                <p className="text-[10px] text-stone-400">NMID: {cafeSettings.qrisNmid || 'ID102003920193'}</p>
              </div>

              {/* QR Image */}
              <div className="p-3 bg-white rounded-2xl border-2 border-stone-200 inline-block shadow-md">
                {qrisQrUrl ? (
                  <img src={qrisQrUrl} alt="QRIS Code" className="w-44 h-44 mx-auto object-contain" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-400">
                    Memuat QRIS...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-500">
                  Nominal Bayar: Rp {totalAmount.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-stone-400">
                  Arahkan pelanggan scan QR di atas menggunakan aplikasi mobile banking atau e-wallet.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateQris}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  qrisVerified
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{qrisVerified ? '✓ Pembayaran QRIS Terverifikasi' : 'Simulasi Pembayaran QRIS Berhasil'}</span>
              </button>
            </div>
          )}

          {/* TAB CONTENT: DEBIT / TRANSFER */}
          {(paymentMethod === 'debit' || paymentMethod === 'transfer') && (
            <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
              isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-amber-500">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {paymentMethod === 'debit' ? 'Pembayaran EDC / Kartu Debit' : 'Pembayaran Transfer Bank'}
                </span>
              </div>
              <p className="text-stone-400 text-[11px]">
                {paymentMethod === 'debit'
                  ? 'Pastikan struk EDC dari mesin kasir sudah tercetak dan pembayaran sukses di mesin EDC.'
                  : `Rekening Kafe: ${cafeSettings.bankAccountInfo || 'BCA 829-102-9941 a.n Kopi Senja'}`}
              </p>
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex justify-between items-center font-bold">
                <span>Total Ditagihkan:</span>
                <span className="text-amber-400 text-sm">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 flex-shrink-0 ${
          isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isDark ? 'border-stone-800 text-stone-400 hover:text-white' : 'border-stone-300 text-stone-600 hover:text-stone-900'
            }`}
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isCashInsufficient || isProcessing}
            onClick={handleSubmitPayment}
            className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              {isProcessing ? 'Memproses...' : `Selesaikan Pembayaran & Cetak Struk (Rp ${totalAmount.toLocaleString('id-ID')})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
