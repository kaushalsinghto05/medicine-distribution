import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  requireReason?: boolean;
  reasonPlaceholder?: string;
  checklistItems?: { label: string; passed: boolean }[];
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  requireReason = false,
  reasonPlaceholder = 'Please enter reason...',
  checklistItems,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Please provide a reason to proceed.');
      return;
    }
    setError('');
    onConfirm(reason);
    setReason('');
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          btn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
          icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-100',
        };
      case 'warning':
        return {
          btn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-100',
        };
      case 'success':
        return {
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
          icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
          iconBg: 'bg-emerald-100',
        };
      default:
        return {
          btn: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500',
          icon: <Info className="w-6 h-6 text-sky-600" />,
          iconBg: 'bg-sky-100',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>

            {checklistItems && checklistItems.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Verification Checklist
                </p>
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {item.passed ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                        ✕
                      </span>
                    )}
                    <span className={item.passed ? 'text-slate-700' : 'text-rose-600 font-medium'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {requireReason && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={reasonPlaceholder}
                  rows={3}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
                {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 ${styles.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
