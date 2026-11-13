import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useCafe } from '../../context/CafeContext';

export const ConfirmationModal: React.FC = () => {
  const { confirmModal, closeConfirmModal, theme } = useCafe();

  if (!confirmModal.isOpen) return null;

  const isDark = theme === 'dark';

  const handleConfirm = async () => {
    try {
      await confirmModal.onConfirm();
    } finally {
      closeConfirmModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-md rounded-3xl shadow-2xl p-6 border transition-all ${
          isDark 
            ? 'bg-stone-900 border-stone-800 text-stone-100' 
            : 'bg-white border-stone-200 text-stone-900'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={closeConfirmModal}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800' : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
          }`}
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-2xl flex-shrink-0 ${
            confirmModal.isDestructive 
              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' 
              : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-snug">
              {confirmModal.title}
            </h3>
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              {confirmModal.message}
            </p>
          </div>
        </div>

        <div className={`flex items-center justify-end gap-3 mt-6 pt-4 border-t ${
          isDark ? 'border-stone-800' : 'border-stone-100'
        }`}>
          <button
            type="button"
            onClick={closeConfirmModal}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              isDark ? 'text-stone-300 hover:text-white hover:bg-stone-800' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {confirmModal.cancelLabel || 'Batal'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-bold rounded-xl shadow-sm transition-all ${
              confirmModal.isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-amber-900/40'
            }`}
          >
            {confirmModal.confirmLabel || 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
};
