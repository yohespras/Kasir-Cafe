import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Download, 
  CloudUpload, 
  CheckCircle, 
  Coffee, 
  ExternalLink,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { saveReceiptToGoogleDrive, isGoogleAuthenticated, loginGoogle, theme, cafeSettings } = useCafe();
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isDark = theme === 'dark';

  if (!order) return null;

  const dateFormatted = new Date(order.timestamp).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const generateReceiptHtml = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Struk Pembayaran #${order.orderNumber} - Kopi Senja</title>
  <style>
    body { font-family: 'Courier New', Courier, monospace; font-size: 13px; max-width: 320px; margin: 0 auto; padding: 20px; color: #111; }
    .center { text-align: center; }
    .divider { border-top: 1px dashed #666; margin: 10px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .bold { font-weight: bold; }
    .items { margin: 8px 0; }
    .item-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .sub-item { font-size: 11px; color: #555; padding-left: 12px; }
    .footer { text-align: center; margin-top: 15px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="center">
    ${cafeSettings.receiptShowLogo ? (
      cafeSettings.receiptLogoType === 'image' && cafeSettings.receiptLogoUrl
        ? `<img src="${cafeSettings.receiptLogoUrl}" style="width: 48px; height: 48px; object-fit: contain; border-radius: 50%; margin: 0 auto 6px auto; display: block; border: 1px solid #ddd;" />`
        : `<div style="width: 36px; height: 36px; background: #222; color: #f59e0b; border-radius: 50%; line-height: 36px; font-weight: 900; font-size: 14px; margin: 0 auto 6px auto; text-align: center;">☕</div>`
    ) : ''}
    <h2 style="margin: 0; font-size: 16px; text-transform: uppercase; font-weight: 800;">${cafeSettings.receiptCafeName || cafeSettings.cafeName}</h2>
    <p style="margin: 2px 0; font-size: 10px; color: #555;">${cafeSettings.tagline}</p>
    <p style="margin: 2px 0; font-size: 10px;">${cafeSettings.address}</p>
    <p style="margin: 2px 0; font-size: 10px;">Telp: ${cafeSettings.phone}</p>
  </div>
  <div class="divider"></div>
  <div class="row"><span>No. Struk:</span><span class="bold">${order.orderNumber}</span></div>
  <div class="row"><span>Waktu:</span><span>${dateFormatted}</span></div>
  <div class="row"><span>Tipe:</span><span>${order.type === 'dine_in' ? `Dine In (Meja ${order.tableNumber})` : 'Takeaway'}</span></div>
  <div class="row"><span>${cafeSettings.receiptCashierPrefix || 'Kasir'}:</span><span>${order.cashierName}</span></div>
  <div class="row"><span>Pelanggan:</span><span>${order.customerName}</span></div>
  <div class="divider"></div>
  <div class="items">
    ${order.items.map(item => `
      <div class="item-row">
        <span>${item.quantity}x ${item.menuItem.name}</span>
        <span>Rp ${item.totalPrice.toLocaleString('id-ID')}</span>
      </div>
      ${item.selectedOptions.temperature ? `<div class="sub-item">- ${item.selectedOptions.temperature} / ${item.selectedOptions.sugar || 'Normal'}</div>` : ''}
      ${(item.selectedOptions.extras || []).map(e => `<div class="sub-item">+ ${e.name}</div>`).join('')}
      ${item.selectedOptions.notes ? `<div class="sub-item">* ${item.selectedOptions.notes}</div>` : ''}
    `).join('')}
  </div>
  <div class="divider"></div>
  <div class="row"><span>Subtotal:</span><span>Rp ${order.subtotal.toLocaleString('id-ID')}</span></div>
  ${order.discount > 0 ? `<div class="row"><span>Diskon (${order.discountCode || ''}):</span><span>-Rp ${order.discount.toLocaleString('id-ID')}</span></div>` : ''}
  <div class="row"><span>PB1 (Pajak 10%):</span><span>Rp ${order.tax.toLocaleString('id-ID')}</span></div>
  <div class="divider"></div>
  <div class="row bold" style="font-size: 15px;"><span>TOTAL BAYAR:</span><span>Rp ${order.totalAmount.toLocaleString('id-ID')}</span></div>
  <div class="row"><span>Metode:</span><span>${order.paymentMethod.toUpperCase()}</span></div>
  <div class="row"><span>Tunai/Bayar:</span><span>Rp ${order.amountPaid.toLocaleString('id-ID')}</span></div>
  <div class="row"><span>Kembalian:</span><span>Rp ${order.change.toLocaleString('id-ID')}</span></div>
  <div class="divider"></div>
  <div class="footer">
    <p style="font-size: 10px; margin: 3px 0;">Wifi: <b>${cafeSettings.receiptWifiUsername || cafeSettings.wifiSsid}</b> | Pass: <b>${cafeSettings.receiptWifiPassword || cafeSettings.wifiPassword}</b></p>
    <p style="font-weight: bold; text-transform: uppercase; margin: 5px 0 2px 0;">${cafeSettings.receiptFooter}</p>
    <p style="font-size: 9px; color: #777;">*** DOKUMEN BUKTI SAH ***</p>
  </div>
</body>
</html>`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (printWindow) {
      printWindow.document.write(generateReceiptHtml());
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    } else {
      // Fallback
      window.print();
    }
  };

  const handleDownload = () => {
    const html = generateReceiptHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Struk_${order.orderNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDrive = async () => {
    if (!isGoogleAuthenticated) {
      try {
        await loginGoogle();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Silakan login Google terlebih dahulu';
        setDriveError(message);
        return;
      }
    }

    setIsUploadingToDrive(true);
    setDriveError(null);
    try {
      const link = await saveReceiptToGoogleDrive(order, generateReceiptHtml());
      setDriveLink(link);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah ke Google Drive';
      setDriveError(message);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleCopyText = () => {
    const textReceipt = `*KOPI SENJA CAFE & ROASTERY*
No. Struk: ${order.orderNumber}
Waktu: ${dateFormatted}
Tipe: ${order.type === 'dine_in' ? `Dine In (Meja ${order.tableNumber})` : 'Takeaway'}
Kasir: ${order.cashierName}
Pelanggan: ${order.customerName}
--------------------------------
${order.items.map(i => `${i.quantity}x ${i.menuItem.name} - Rp ${i.totalPrice.toLocaleString('id-ID')}`).join('\n')}
--------------------------------
Subtotal: Rp ${order.subtotal.toLocaleString('id-ID')}
Diskon: Rp ${order.discount.toLocaleString('id-ID')}
PB1 (10%): Rp ${order.tax.toLocaleString('id-ID')}
TOTAL: Rp ${order.totalAmount.toLocaleString('id-ID')}
Bayar (${order.paymentMethod.toUpperCase()}): Rp ${order.amountPaid.toLocaleString('id-ID')}
Kembalian: Rp ${order.change.toLocaleString('id-ID')}
--------------------------------
Terima kasih telah berkunjung!`;

    navigator.clipboard.writeText(textReceipt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] border transition-colors ${
          isDark 
            ? 'bg-stone-900 border-stone-800 text-stone-100' 
            : 'bg-white border-stone-200 text-stone-900'
        }`}
        role="dialog"
      >
        {/* Left Side: Receipt Paper Simulation */}
        <div className={`flex-1 p-6 overflow-y-auto flex flex-col items-center border-b md:border-b-0 ${
          isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-100 border-stone-200'
        }`}>
          <div className="w-full max-w-[320px] bg-white text-stone-900 p-6 rounded-sm shadow-xl font-mono text-xs select-text border-t-8 border-amber-600">
            {/* Header */}
            <div className="text-center space-y-1 mb-4">
              {cafeSettings.receiptShowLogo && (
                <div className="flex justify-center mb-1">
                  {cafeSettings.receiptLogoType === 'image' && cafeSettings.receiptLogoUrl ? (
                    <img 
                      src={cafeSettings.receiptLogoUrl} 
                      alt="Logo Struk" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-stone-200 shadow-xs" 
                    />
                  ) : cafeSettings.receiptLogoType === 'monogram' ? (
                    <div className="w-10 h-10 bg-stone-900 text-amber-500 rounded-full flex items-center justify-center font-black text-sm tracking-widest shadow-xs">
                      {cafeSettings.receiptCafeName.substring(0, 2).toUpperCase() || 'KS'}
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-stone-900 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                      <Coffee className="w-5 h-5" />
                    </div>
                  )}
                </div>
              )}
              <h4 className="font-extrabold text-sm tracking-wider uppercase">
                {cafeSettings.receiptCafeName || cafeSettings.cafeName}
              </h4>
              <p className="text-[10px] text-stone-600">{cafeSettings.tagline}</p>
              <p className="text-[9px] text-stone-500">{cafeSettings.address}</p>
              <p className="text-[9px] text-stone-500">Telp: {cafeSettings.phone}</p>
            </div>

            <div className="border-t border-dashed border-stone-400 my-2" />

            {/* Meta */}
            <div className="space-y-0.5 text-[10px] text-stone-700">
              <div className="flex justify-between">
                <span>No. Struk</span>
                <span className="font-bold text-stone-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{dateFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span>{cafeSettings.receiptCashierPrefix || 'Kasir'}</span>
                <span className="font-semibold text-stone-900">{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan</span>
                <span className="truncate max-w-[140px]">{order.customerName}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900">
                <span>Layanan</span>
                <span>{order.type === 'dine_in' ? `MEJA ${order.tableNumber}` : 'TAKEAWAY'}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-stone-400 my-2" />

            {/* Item list */}
            <div className="space-y-2 py-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold text-stone-900">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <span>Rp {item.totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  {item.selectedOptions.temperature && (
                    <div className="text-[9px] text-stone-500 pl-3">
                      • {item.selectedOptions.temperature} / {item.selectedOptions.sugar || 'Normal 100%'}
                    </div>
                  )}
                  {(item.selectedOptions.extras || []).map((ext, eIdx) => (
                    <div key={eIdx} className="text-[9px] text-stone-500 pl-3">
                      + {ext.name} (Rp {ext.price.toLocaleString('id-ID')})
                    </div>
                  ))}
                  {item.selectedOptions.notes && (
                    <div className="text-[9px] text-amber-700 italic pl-3">
                      * {item.selectedOptions.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-stone-400 my-2" />

            {/* Totals */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Diskon {order.discountCode ? `(${order.discountCode})` : ''}</span>
                  <span>-Rp {order.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Pajak Resto (PB1 10%)</span>
                <span>Rp {order.tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-stone-900 pt-1 flex justify-between font-extrabold text-sm text-stone-900">
                <span>TOTAL</span>
                <span>Rp {order.totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Bayar ({order.paymentMethod.toUpperCase()})</span>
                <span>Rp {order.amountPaid.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Kembalian</span>
                <span>Rp {order.change.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-stone-400 my-3" />

            {/* Barcode & Footer */}
            <div className="text-center space-y-1">
              <div className="flex justify-center py-1 opacity-80">
                <div className="font-mono tracking-widest text-lg font-black tracking-[0.25em]">
                  ||||| | |||| || ||| |
                </div>
              </div>
              <p className="text-[9px] text-stone-600">
                Wifi: <strong>{cafeSettings.receiptWifiUsername || cafeSettings.wifiSsid}</strong> | Pass: <strong>{cafeSettings.receiptWifiPassword || cafeSettings.wifiPassword}</strong>
              </p>
              <p className="text-[9px] font-bold text-stone-700 uppercase">{cafeSettings.receiptFooter}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Action Panel */}
        <div className={`w-full md:w-72 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l ${
          isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <div>
            <div className={`flex items-center justify-between pb-4 border-b ${
              isDark ? 'border-stone-800' : 'border-stone-200'
            }`}>
              <div>
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Pembayaran Sukses
                </span>
                <h3 className={`text-lg font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  Struk Transaksi
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200'
                }`}
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drive Upload Status Notification */}
            {driveLink && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Tersimpan di Google Drive</span>
                </div>
                <a
                  href={driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500 hover:underline flex items-center gap-1 pt-1 font-medium"
                >
                  Buka di Google Drive <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {driveError && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{driveError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Thermal</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToDrive}
                disabled={isUploadingToDrive}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 font-medium rounded-xl border transition-all text-sm disabled:opacity-50 cursor-pointer ${
                  isDark 
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border-stone-700' 
                    : 'bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 border-stone-300 shadow-xs'
                }`}
              >
                <CloudUpload className="w-4 h-4 text-blue-500" />
                <span>{isUploadingToDrive ? 'Mengunggah...' : 'Simpan ke Google Drive'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 font-medium rounded-xl border transition-all text-sm cursor-pointer ${
                  isDark 
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border-stone-700' 
                    : 'bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 border-stone-300 shadow-xs'
                }`}
              >
                <Copy className="w-4 h-4 text-emerald-500" />
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Teks Struk'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 font-medium rounded-xl border transition-all text-sm cursor-pointer ${
                  isDark 
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border-stone-700' 
                    : 'bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 border-stone-300 shadow-xs'
                }`}
              >
                <Download className={`w-4 h-4 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} />
                <span>Unduh File HTML</span>
              </button>
            </div>
          </div>

          <div className={`pt-4 border-t mt-4 ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/50' 
                  : 'bg-stone-200 hover:bg-stone-300 text-stone-700 hover:text-stone-900'
              }`}
            >
              Tutup & Lanjut Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
