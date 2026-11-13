import React, { useState } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';
import { MenuItem, SelectedOptions } from '../../types/cafe';
import { useCafe } from '../../context/CafeContext';

interface ItemCustomizeModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (item: MenuItem, options: SelectedOptions, quantity: number) => void;
}

export const ItemCustomizeModal: React.FC<ItemCustomizeModalProps> = ({
  item,
  onClose,
  onConfirm
}) => {
  const { theme } = useCafe();
  const isDark = theme === 'dark';

  if (!item) return null;

  const defaultIce = item.options?.iceOptions?.[0] || 'Normal Ice';
  const defaultSugar = item.options?.sugarOptions?.[0] || 'Normal 100%';

  const [selectedIce, setSelectedIce] = useState<string>(defaultIce);
  const [selectedSugar, setSelectedSugar] = useState<string>(defaultSugar);
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const toggleExtra = (extra: { name: string; price: number }) => {
    if (selectedExtras.some(e => e.name === extra.name)) {
      setSelectedExtras(prev => prev.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras(prev => [...prev, extra]);
    }
  };

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const unitPrice = item.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleSave = () => {
    onConfirm(
      item,
      {
        temperature: (item.options?.iceOptions?.length ? (selectedIce as SelectedOptions['temperature']) : undefined),
        sugar: (item.options?.sugarOptions?.length ? (selectedSugar as SelectedOptions['sugar']) : undefined),
        extras: selectedExtras.length > 0 ? selectedExtras : undefined,
        notes: notes.trim() || undefined
      },
      quantity
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-all ${
          isDark ? 'bg-stone-900 border-stone-850 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
        role="dialog"
      >
        {/* Header */}
        <div className="relative h-44 w-full bg-stone-950 flex-shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-stone-900/80 backdrop-blur-md text-stone-300 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-6 right-6">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full inline-block mb-1">
              {item.category.replace('_', ' ')}
            </span>
            <h3 className="text-xl font-black text-white drop-shadow-sm">{item.name}</h3>
            <p className="text-amber-400 font-black text-lg">Rp {item.price.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className={`p-6 overflow-y-auto space-y-6 flex-1 divide-y ${
          isDark ? 'divide-stone-850' : 'divide-stone-100'
        }`}>
          {/* Temperature / Ice */}
          {item.options?.iceOptions && item.options.iceOptions.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                isDark ? 'text-stone-300' : 'text-stone-700'
              }`}>
                <span>Pilihan Es / Suhu</span>
                <span className="text-[10px] opacity-60 font-normal">Pilih salah satu</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {item.options.iceOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedIce(opt)}
                    className={`py-2 px-3 text-xs rounded-xl font-bold border text-center transition-all ${
                      selectedIce === opt
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                        : isDark
                        ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness / Sugar / Level */}
          {item.options?.sugarOptions && item.options.sugarOptions.length > 0 && (
            <div className="space-y-3 pt-4">
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                isDark ? 'text-stone-300' : 'text-stone-700'
              }`}>
                <span>Tingkat Kemanisan / Level</span>
                <span className="text-[10px] opacity-60 font-normal">Pilih salah satu</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {item.options.sugarOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedSugar(opt)}
                    className={`py-2 px-3 text-xs rounded-xl font-bold border text-center transition-all ${
                      selectedSugar === opt
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                        : isDark
                        ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons / Extras */}
          {item.options?.additions && item.options.additions.length > 0 && (
            <div className="space-y-3 pt-4">
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                isDark ? 'text-stone-300' : 'text-stone-700'
              }`}>
                <span>Tambahan / Add-ons</span>
                <span className="text-[10px] opacity-60 font-normal">Bisa pilih lebih dari satu</span>
              </label>
              <div className="space-y-2">
                {item.options.additions.map(extra => {
                  const isChecked = selectedExtras.some(e => e.name === extra.name);
                  return (
                    <button
                      key={extra.name}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                        isChecked
                          ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-bold'
                          : isDark
                          ? 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-850'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-amber-500 border-amber-500 text-stone-950' : 'border-stone-500 bg-stone-900'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="font-semibold text-xs">{extra.name}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-500">
                        +Rp {extra.price.toLocaleString('id-ID')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Notes */}
          <div className="space-y-2 pt-4">
            <label className={`text-xs font-bold uppercase tracking-wider block ${
              isDark ? 'text-stone-300' : 'text-stone-700'
            }`}>
              Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: jangan terlalu manis, saus dipisah..."
              className={`w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                isDark ? 'bg-stone-950 border-stone-800 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-900'
              }`}
            />
          </div>
        </div>

        {/* Footer with Quantity & Submit */}
        <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-4 ${
          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className={`flex items-center gap-3 border p-1 rounded-xl ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
          }`}>
            <button
              type="button"
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
              className="p-2 text-stone-400 hover:text-white disabled:opacity-40 rounded-lg transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(prev => prev + 1)}
              className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-2xl shadow-lg shadow-amber-950/30 flex items-center justify-between transition-all"
          >
            <span>Tambahkan ke Pesanan</span>
            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
