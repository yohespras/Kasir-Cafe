import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { 
    totalAmount, 
    subtotalAmount, 
    taxAmount, 
    discountAmount, 
    orderType, 
    selectedTableNumber, 
    customerName,
    createOrder,
    theme,
    cafeSettings,
    serviceChargeAmount
  } = useCafe();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(totalAmount);
  const [customCashInput, setCustomCashInput] = useState<string>(totalAmount.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrisPaid, setQrisPaid] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('BCA');
  const [cardApprovalCode, setCardApprovalCode] = useState<string>('');
  const [qrisQrUrl, setQrisQrUrl] = useState<string>('');

  useEffect(() => {
    if (totalAmount > 0) {
      const qrisPayload = `00020101021226${cafeSettings.qrisNmid || 'ID1020039201'}52045812530336054${totalAmount}5802ID59${encodeURIComponent(cafeSettings.qrisMerchantName || 'Kopi Senja Specialty')}6007Jakarta6304`;
      QRCode.toDataURL(qrisPayload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      }).then(url => setQrisQrUrl(url)).catch(err => console.error(err));
    }
  }, [totalAmount, cafeSettings]);

  if (!isOpen) return null;

  // Preset quick cash buttons
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
    setQrisPaid(true);
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
      const paidAmount = paymentMethod === 'cash' ? cashGiven : totalAmount;
      createOrder(paymentMethod, paidAmount);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border transition-colors ${
          isDark
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
        role="dialog"
      >
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                {orderType === 'dine_in' ? `Dine-In • Meja ${selectedTableNumber}` : 'Takeaway (Bungkus)'}
              </span>
              {customerName && (
                <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  • {customerName}
                </span>
              )}
            </div>
            <h3 className="text-xl font-black mt-0.5">Pembayaran Tagihan Kasir</h3>
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Total Summary Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDark
              ? 'bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/20 border-amber-500/25'
              : 'bg-amber-50/70 border-amber-200 text-stone-900'
          }`}>
            <div>
              <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Total yang Harus Dibayar
              </span>
              <p className="text-2xl sm:text-3xl font-black text-amber-500">
                Rp {totalAmount.toLocaleString('id-ID')}
              </p>
            </div>
            <div className={`text-right text-xs space-y-0.5 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              <p>Subtotal: Rp {subtotalAmount.toLocaleString('id-ID')}</p>
              {discountAmount > 0 && (
                <p className="text-emerald-500 font-bold">
                  Diskon: -Rp {discountAmount.toLocaleString('id-ID')}
                </p>
              )}
              {taxAmount > 0 && (
                <p>PB1 ({cafeSettings.taxRate}%): Rp {taxAmount.toLocaleString('id-ID')}</p>
              )}
              {serviceChargeAmount > 0 && (
                <p>Layanan ({cafeSettings.serviceChargeRate}%): Rp {serviceChargeAmount.toLocaleString('id-ID')}</p>
              )}
            </div>
          </div>

          {/* Primary Payment Selector: Highlight Tunai & QRIS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-stone-400' : 'text-stone-600'
              }`}>
                Pilih Metode Pembayaran (Tunai / QRIS)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2.5">
              {/* Tunai (Cash) Primary Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-500 ring-2 ring-amber-500 shadow-md'
                    : isDark
                    ? 'bg-stone-950 border-stone-850 text-stone-400 hover:bg-stone-850 hover:text-stone-200'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${
                  paymentMethod === 'cash' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-amber-400'
                }`}>
                  <Banknote className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className={`text-base font-extrabold ${
                    paymentMethod === 'cash' ? (isDark ? 'text-amber-400' : 'text-amber-700') : (isDark ? 'text-stone-200' : 'text-stone-800')
                  }`}>
                    💵 TUNAI (CASH)
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Hitung uang pas & kembalian otomatis
                  </p>
                </div>
              </button>

              {/* QRIS Primary Button */}
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'qris'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-500 ring-2 ring-amber-500 shadow-md'
                    : isDark
                    ? 'bg-stone-950 border-stone-850 text-stone-400 hover:bg-stone-850 hover:text-stone-200'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${
                  paymentMethod === 'qris' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-amber-400'
                }`}>
                  <QrCode className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className={`text-base font-extrabold ${
                    paymentMethod === 'qris' ? (isDark ? 'text-amber-400' : 'text-amber-700') : (isDark ? 'text-stone-200' : 'text-stone-800')
                  }`}>
                    📱 QRIS DINAMIS
                  </h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    BCA, GoPay, OVO, ShopeePay, Dana
                  </p>
                </div>
              </button>
            </div>

            {/* Secondary: EDC & Transfer Bank */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('debit')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
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
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
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

          {/* Details for TUNAI (Cash) */}
          {paymentMethod === 'cash' && (
            <div className={`space-y-4 p-5 rounded-2xl border ${
              isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div>
                <label className={`text-xs font-bold block mb-1.5 ${
                  isDark ? 'text-stone-400' : 'text-stone-600'
                }`}>
                  Nominal Uang Diterima dari Pelanggan (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-lg">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={customCashInput}
                    onChange={handleCustomCashChange}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl text-xl font-black border focus:outline-none focus:border-amber-500 ${
                      isDark
                        ? 'bg-stone-900 border-stone-700 text-stone-100'
                        : 'bg-white border-stone-300 text-stone-900'
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className={`text-xs block mb-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Pecahan Cepat Kasir:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {cashOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCashOptionClick(opt.amount)}
                      className={`py-2 px-2 text-xs rounded-xl font-bold border text-center transition-all ${
                        cashGiven === opt.amount
                          ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                          : isDark
                          ? 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kembalian Live Calculation */}
              <div className={`pt-3 border-t flex items-center justify-between ${
                isDark ? 'border-stone-800' : 'border-stone-200'
              }`}>
                <span className="text-sm font-bold">Uang Kembalian:</span>
                {isCashInsufficient ? (
                  <span className="text-rose-500 text-xs font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Uang kurang Rp {(totalAmount - cashGiven).toLocaleString('id-ID')}
                  </span>
                ) : (
                  <span className="text-2xl font-black text-emerald-500">
                    Rp {change.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Details for QRIS */}
          {paymentMethod === 'qris' && (
            <div className={`p-5 rounded-2xl border flex flex-col items-center text-center space-y-4 ${
              isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="bg-white p-4 rounded-3xl shadow-xl flex flex-col items-center border border-stone-300">
                <div className="w-48 h-48 flex items-center justify-center rounded-2xl overflow-hidden">
                  {qrisQrUrl ? (
                    <img src={qrisQrUrl} alt="QRIS Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-500">
                      Memuat QRIS...
                    </div>
                  )}
                </div>
                <div className="pt-2 text-[10px] font-mono text-stone-800 font-bold">
                  NMID: {cafeSettings.qrisNmid} • {cafeSettings.qrisMerchantName}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold">
                  Tunjukkan kode QRIS di atas kepada pelanggan
                </p>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Nominal pas otomatis tertera: <strong className="text-amber-500">Rp {totalAmount.toLocaleString('id-ID')}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateQris}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                  qrisPaid 
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' 
                    : isDark
                    ? 'bg-stone-900 hover:bg-stone-850 text-amber-400 border border-stone-700'
                    : 'bg-white hover:bg-stone-100 text-amber-600 border border-stone-300'
                }`}
              >
                {qrisPaid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Pembayaran QRIS Berhasil Diterima!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Simulasikan Scan & Notifikasi Bank Masuk</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Details for DEBIT */}
          {paymentMethod === 'debit' && (
            <div className={`space-y-4 p-5 rounded-2xl border ${
              isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block">Pilih Mesin EDC / Bank</label>
                <div className="grid grid-cols-4 gap-2">
                  {['BCA', 'Mandiri', 'BRI', 'BNI'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        selectedBank === bank
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                          : isDark
                          ? 'bg-stone-900 border-stone-800 text-stone-400'
                          : 'bg-white border-stone-300 text-stone-700'
                      }`}
                    >
                      EDC {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 mb-1.5 block">
                  Nomor Referensi Kartu (4 Digit Terakhir)
                </label>
                <input
                  type="text"
                  value={cardApprovalCode}
                  onChange={e => setCardApprovalCode(e.target.value)}
                  placeholder="Contoh: 8841 (Opsional)"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-amber-500 ${
                    isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Details for TRANSFER */}
          {paymentMethod === 'transfer' && (
            <div className={`space-y-3 p-5 rounded-2xl border text-xs ${
              isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <p className="font-bold">Rekening Resmi Operasional Cafe:</p>
              <div className={`p-3 rounded-xl space-y-1.5 font-mono border ${
                isDark ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white border-stone-300 text-stone-800'
              }`}>
                <p className="font-bold text-amber-500">{cafeSettings.bankAccountInfo}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-5 sm:p-6 border-t flex items-center justify-between gap-4 ${
          isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-3 text-sm font-semibold rounded-xl transition-colors ${
              isDark ? 'text-stone-400 hover:text-white hover:bg-stone-850' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isCashInsufficient || isProcessing}
            onClick={handleSubmitPayment}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-black rounded-2xl shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isProcessing
                ? 'Memproses...'
                : paymentMethod === 'cash'
                ? `Bayar Tunai & Cetak Struk (Rp ${totalAmount.toLocaleString('id-ID')})`
                : paymentMethod === 'qris'
                ? `Konfirmasi Bayar QRIS (Rp ${totalAmount.toLocaleString('id-ID')})`
                : `Selesaikan Transaksi (Rp ${totalAmount.toLocaleString('id-ID')})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
