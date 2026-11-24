import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, X } from 'lucide-react';
import { ADMIN_PASSCODE } from '../config/portalConfig';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export function AdminPasscodeModal({
  isOpen,
  onClose,
  onUnlock,
}: AdminPasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError(null);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      setError(null);
      setPasscode('');
      onUnlock();
    } else {
      setError('លេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ សូមព្យាយាមម្ដងទៀត។');
      inputRef.current?.select();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2429]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-passcode-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f4c5c]/10 text-[#0f4c5c] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="admin-passcode-title"
                className="text-base font-bold text-[#0f4c5c]"
              >
                ចូលប្រើប្រាស់ Admin Mode
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                សូមបញ្ចូលលេខកូដសម្ងាត់ដើម្បីគ្រប់គ្រងទិន្នន័យ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="បិទផ្ទាំង"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
          <label
            htmlFor="admin-passcode-input"
            className="block text-sm font-medium text-[#112429] mb-1.5"
          >
            លេខកូដសម្ងាត់ (Passcode)
          </label>
          <input
            ref={inputRef}
            id="admin-passcode-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              if (error) setError(null);
            }}
            placeholder="••••"
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-center text-lg tracking-[0.35em] font-semibold text-[#112429] tabular-nums focus:outline-none focus:border-[#136f63] focus:ring-2 focus:ring-[#136f63]/20"
          />

          {error && (
            <p role="alert" className="mt-2.5 text-xs text-rose-600 font-medium">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-5 py-2 rounded-xl bg-[#0f4c5c] hover:bg-[#136f63] text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136f63]"
            >
              ដោះសោ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
