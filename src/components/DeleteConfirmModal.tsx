import { Loader2, Trash2, X } from 'lucide-react';
import type { MemberRecord } from '../types/member';

interface DeleteConfirmModalProps {
  member: MemberRecord | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  member,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2429]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      onClick={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="delete-confirm-title"
                className="text-base font-bold text-[#112429]"
              >
                បញ្ជាក់ការលុបទិន្នន័យ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            aria-label="បិទផ្ទាំង"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-5 text-sm text-slate-600">
          តើអ្នកពិតជាចង់លុបព័ត៌មានរបស់{' '}
          <span className="font-semibold text-[#0f4c5c]">{member.fullName}</span>{' '}
          ({member.phone}) ចេញពីបញ្ជីមែនទេ?
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            បោះបង់
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-65"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>កំពុងលុប...</span>
              </>
            ) : (
              <span>លុបទិន្នន័យ</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
