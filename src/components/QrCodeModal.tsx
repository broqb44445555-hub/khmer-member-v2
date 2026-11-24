import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Loader2, X } from 'lucide-react';
import type { MemberRecord } from '../types/member';
import { buildMemberQrPayload } from '../utils/exportTools';
import { SuitPersonAvatar } from './SuitPersonAvatar';

interface QrCodeModalProps {
  member: MemberRecord | null;
  onClose: () => void;
}

export function QrCodeModal({ member, onClose }: QrCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    if (!member) {
      setQrDataUrl(null);
      setQrError(false);
      return;
    }

    let cancelled = false;
    setQrDataUrl(null);
    setQrError(false);

    const payload = buildMemberQrPayload(member);
    QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0f4c5c',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [member]);

  if (!member) return null;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    const safeName = member.fullName.replace(/\s+/g, '_') || String(member.id);
    link.download = `QR_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f2429]/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <SuitPersonAvatar
              src={member.photo}
              alt={member.fullName}
              size="sm"
            />
            <div className="min-w-0">
              <h3
                id="qr-modal-title"
                className="text-base font-bold text-[#0f4c5c] truncate"
              >
                {member.fullName}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {member.role} · {member.gender}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="បិទផ្ទាំង QR Code"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col items-center">
          <div className="w-60 h-60 rounded-2xl border border-slate-200 bg-white p-3 flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code សម្រាប់ ${member.fullName}`}
                className="w-full h-full object-contain"
              />
            ) : qrError ? (
              <p className="text-xs text-rose-600 text-center px-3">
                មិនអាចបង្កើត QR Code បានទេ
              </p>
            ) : (
              <Loader2 className="w-7 h-7 text-[#0f4c5c] animate-spin" />
            )}
          </div>

          <dl className="w-full mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-slate-400">លេខទូរសព្ទ</dt>
              <dd className="font-medium text-[#112429] tabular-nums mt-0.5">
                {member.phone}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Telegram</dt>
              <dd className="font-medium text-[#112429] truncate mt-0.5">
                {member.telegram || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">ថ្ងៃខែឆ្នាំកំណើត</dt>
              <dd className="font-medium text-[#112429] tabular-nums mt-0.5">
                {member.dob || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">កាលបរិច្ឆេទចុះឈ្មោះ</dt>
              <dd className="font-medium text-[#112429] tabular-nums mt-0.5">
                {member.joinDate}
              </dd>
            </div>
            {member.address && (
              <div className="col-span-2">
                <dt className="text-slate-400">អាសយដ្ឋាន</dt>
                <dd className="font-medium text-[#112429] mt-0.5">
                  {member.address}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="px-6 py-4 bg-[#f8fbfb] border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            បិទ
          </button>
          <button
            type="button"
            disabled={!qrDataUrl}
            onClick={handleDownloadQr}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-[#0f4c5c] hover:bg-[#136f63] text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>ទាញយក QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
