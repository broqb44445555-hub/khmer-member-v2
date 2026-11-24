import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  FileSpreadsheet,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { isAppsScriptConfigured } from '../config/portalConfig';
import type { GenderFilter, MemberRecord } from '../types/member';
import {
  copyMembersForGoogleSheets,
  exportMembersToExcel,
} from '../utils/exportTools';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { QrCodeModal } from './QrCodeModal';
import { SuitPersonAvatar } from './SuitPersonAvatar';

interface AdminDashboardProps {
  members: MemberRecord[];
  isLoading: boolean;
  loadError: string | null;
  onRefresh: () => Promise<void>;
  onDeleteMember: (id: number) => Promise<void>;
}

const GENDER_FILTERS: GenderFilter[] = ['ទាំងអស់', 'ប្រុស', 'ស្រី'];

export function AdminDashboard({
  members,
  isLoading,
  loadError,
  onRefresh,
  onDeleteMember,
}: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('ទាំងអស់');
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [qrMember, setQrMember] = useState<MemberRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MemberRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      if (genderFilter !== 'ទាំងអស់' && member.gender !== genderFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        member.fullName,
        member.phone,
        member.telegram,
        member.role,
        member.address,
        member.joinDate,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [members, searchQuery, genderFilter]);

  const handleCopyForSheets = async () => {
    if (filteredMembers.length === 0) return;
    const ok = await copyMembersForGoogleSheets(filteredMembers);
    if (ok) {
      setCopiedTsv(true);
      setTimeout(() => setCopiedTsv(false), 2500);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteMember(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const appsScriptConfigured = isAppsScriptConfigured();

  return (
    <section
      aria-labelledby="admin-dashboard-heading"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,76,92,0.04)] overflow-hidden"
    >
      {/* Top Toolbar */}
      <div className="px-5 sm:px-7 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2
            id="admin-dashboard-heading"
            className="text-lg sm:text-xl font-bold text-[#0f4c5c]"
          >
            បញ្ជីសមាជិក និងភ្ញៀវទាំងអស់
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 tabular-nums">
            បង្ហាញ {filteredMembers.length} នាក់ ក្នុងចំណោមសរុប {members.length} នាក់
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void onRefresh()}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-[#0f4c5c] hover:bg-[#f4f7f7] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 shrink-0 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>ធ្វើបច្ចុប្បន្នភាព</span>
          </button>

          <button
            type="button"
            disabled={filteredMembers.length === 0}
            onClick={() => exportMembersToExcel(filteredMembers)}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 rounded-xl bg-[#136f63] hover:bg-[#0f4c5c] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>នាំចេញ Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            disabled={filteredMembers.length === 0}
            onClick={() => void handleCopyForSheets()}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0f4c5c]/25 bg-[#f4f7f7] hover:bg-[#e8f0f1] text-[#0f4c5c] text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copiedTsv ? (
              <>
                <Check className="w-4 h-4 text-[#136f63] shrink-0" aria-hidden="true" />
                <span>បានចម្លងរួចរាល់</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>ចម្លងសម្រាប់ Google Sheets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search & Gender Segmented Filter */}
      <div className="px-5 sm:px-7 py-4 bg-[#f8fbfb] border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរសព្ទ Telegram តួនាទី ឬអាសយដ្ឋាន..."
            aria-label="ស្វែងរកសមាជិក"
            className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-[#112429] placeholder:text-slate-400 focus:outline-none focus:border-[#136f63] focus:ring-2 focus:ring-[#136f63]/20"
          />
        </div>

        <div
          role="group"
          aria-label="ច្រោះតាមភេទ"
          className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 self-start sm:self-auto shrink-0"
        >
          {GENDER_FILTERS.map((option) => {
            const active = genderFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setGenderFilter(option)}
                className={`min-h-[34px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#0f4c5c] shadow-xs'
                    : 'text-slate-600 hover:text-[#112429]'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtle notice if Google Apps Script URL is still the placeholder or had a fetch error */}
      {(!appsScriptConfigured || loadError) && (
        <div className="px-5 sm:px-7 py-3 bg-amber-50/80 border-b border-amber-200/70 text-xs sm:text-sm text-amber-900">
          {loadError
            ? loadError
            : 'កំពុងប្រើប្រាស់ទិន្នន័យបម្រុងក្នុងឧបករណ៍៖ សូមជំនួស PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE ក្នុង portalConfig.ts ដើម្បីភ្ជាប់ទិន្នន័យ Google Sheets ផ្ទាល់ពីគ្រប់ឧបករណ៍។'}
        </div>
      )}

      {/* Content Area */}
      {isLoading && members.length === 0 ? (
        <div className="p-6 space-y-3" aria-busy="true">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="h-14 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#e8f0f1] text-[#0f4c5c] flex items-center justify-center">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="mt-3.5 text-base font-semibold text-[#112429]">
            {members.length === 0
              ? 'មិនទាន់មានទិន្នន័យចុះឈ្មោះនៅឡើយទេ'
              : 'រកមិនឃើញទិន្នន័យដែលត្រូវនឹងការស្វែងរក'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {members.length === 0
              ? 'នៅពេលមានសមាជិក ឬភ្ញៀវចុះឈ្មោះតាមទម្រង់ខាងលើ បញ្ជីនឹងបង្ហាញនៅទីនេះ។'
              : 'សូមសាកល្បងប្ដូរពាក្យស្វែងរក ឬជ្រើសរើសភេទ "ទាំងអស់"។'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3.5 pl-7 pr-4 whitespace-nowrap">សមាជិក / ភ្ញៀវ</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">ភេទ</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">លេខទូរសព្ទ</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Telegram</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">តួនាទី / ប្រភេទភ្ញៀវ</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">អាសយដ្ឋាន</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">ថ្ងៃចុះឈ្មោះ</th>
                  <th className="py-3.5 pl-3 pr-7 text-right whitespace-nowrap">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-[#f4f7f7]/70 transition-colors duration-100"
                  >
                    <td className="py-3.5 pl-7 pr-4">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <SuitPersonAvatar
                          src={member.photo}
                          alt={member.fullName}
                          size="sm"
                        />
                        <span className="font-semibold text-[#112429] truncate max-w-[200px]">
                          {member.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      {member.gender}
                    </td>
                    <td className="py-3.5 px-3 text-[#112429] font-medium tabular-nums whitespace-nowrap">
                      {member.phone}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {member.telegram || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 max-w-[180px] truncate">
                      {member.role}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-[200px] truncate">
                      {member.address || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 tabular-nums whitespace-nowrap">
                      {member.dob || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 tabular-nums whitespace-nowrap">
                      {member.joinDate}
                    </td>
                    <td className="py-3.5 pl-3 pr-7 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQrMember(member)}
                          className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg border border-[#0f4c5c]/20 text-xs font-medium text-[#0f4c5c] hover:bg-[#0f4c5c] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>QR Code</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(member)}
                          aria-label={`លុប ${member.fullName}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card List View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredMembers.map((member) => (
              <article key={member.id} className="p-4 sm:p-5">
                <div className="flex items-start gap-3.5">
                  <SuitPersonAvatar
                    src={member.photo}
                    alt={member.fullName}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[#112429] truncate">
                      {member.fullName}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span>{member.gender}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{member.role}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="tabular-nums">{member.joinDate}</span>
                    </p>
                  </div>
                </div>

                <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
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
                    <dt className="text-slate-400">អាសយដ្ឋាន</dt>
                    <dd className="font-medium text-[#112429] truncate mt-0.5">
                      {member.address || '-'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setQrMember(member)}
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 rounded-xl border border-[#0f4c5c]/25 text-xs font-semibold text-[#0f4c5c] hover:bg-[#f4f7f7] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(member)}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>លុប</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* QR Code Modal (Admin only) */}
      <QrCodeModal member={qrMember} onClose={() => setQrMember(null)} />

      {/* Delete Confirmation Modal (Admin only) */}
      <DeleteConfirmModal
        member={pendingDelete}
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  );
}
