import { CheckCircle2, X } from 'lucide-react';
import type { RegistrationSubmitStatus } from '../types/member';
import { SuitPersonAvatar } from './SuitPersonAvatar';

interface SuccessModalProps {
  status: RegistrationSubmitStatus | null;
  onClose: () => void;
}

export function SuccessModal({ status, onClose }: SuccessModalProps) {
  if (!status) return null;

  const { record } = status;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2429]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#136f63]/12 text-[#136f63] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="success-modal-title"
                className="text-lg font-bold text-[#0f4c5c]"
              >
                ចុះឈ្មោះជោគជ័យ!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ព័ត៌មានត្រូវបានកត់ត្រា និងជូនដំណឹងរួចរាល់
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

        <div className="px-6 py-4 border-y border-slate-100 bg-[#f8fbfb]">
          <div className="flex items-center gap-3.5">
            <SuitPersonAvatar
              src={record.photo}
              alt={record.fullName}
              size="md"
            />
            <div className="min-w-0">
              <p className="font-semibold text-[#112429] truncate">
                {record.fullName}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                <span>{record.gender}</span>
                <span aria-hidden="true"> · </span>
                <span>{record.role}</span>
                <span aria-hidden="true"> · </span>
                <span className="tabular-nums">{record.phone}</span>
              </p>
            </div>
          </div>

          <dl className="mt-4 pt-3.5 border-t border-slate-200/70 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500">កាលបរិច្ឆេទចុះឈ្មោះ</dt>
              <dd className="font-medium text-[#112429] tabular-nums">
                {record.joinDate}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500">ការជូនដំណឹង Telegram</dt>
              <dd className="font-medium text-[#136f63] tabular-nums">
                {status.telegramSentCount}/{status.telegramTotalCount} គណនី
              </dd>
            </div>
          </dl>
        </div>

        <div className="px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0f4c5c] hover:bg-[#136f63] text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136f63]"
          >
            យល់ព្រម
          </button>
        </div>
      </div>
    </div>
  );
}
