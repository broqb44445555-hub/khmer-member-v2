import * as XLSX from 'xlsx';
import { getTodayIsoDate } from '../config/portalConfig';
import type { MemberRecord } from '../types/member';

const KHMER_HEADERS = [
  'ល.រ',
  'លេខសម្គាល់',
  'ឈ្មោះពេញ',
  'ភេទ',
  'លេខទូរសព្ទ',
  'Telegram',
  'តួនាទី / ប្រភេទភ្ញៀវ',
  'អាសយដ្ឋាន',
  'ថ្ងៃខែឆ្នាំកំណើត',
  'កាលបរិច្ឆេទចុះឈ្មោះ',
];

function sanitizeTsvCell(value: string | number | undefined): string {
  return String(value ?? '')
    .replace(/\t/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim();
}

export function exportMembersToExcel(members: MemberRecord[]): void {
  const rows = members.map((member, index) => ({
    [KHMER_HEADERS[0]]: index + 1,
    [KHMER_HEADERS[1]]: member.id,
    [KHMER_HEADERS[2]]: member.fullName,
    [KHMER_HEADERS[3]]: member.gender,
    [KHMER_HEADERS[4]]: member.phone,
    [KHMER_HEADERS[5]]: member.telegram || '-',
    [KHMER_HEADERS[6]]: member.role,
    [KHMER_HEADERS[7]]: member.address || '-',
    [KHMER_HEADERS[8]]: member.dob || '-',
    [KHMER_HEADERS[9]]: member.joinDate,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: KHMER_HEADERS });
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 24 },
    { wch: 10 },
    { wch: 16 },
    { wch: 18 },
    { wch: 24 },
    { wch: 30 },
    { wch: 16 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'សមាជិក និងភ្ញៀវ');
  XLSX.writeFile(workbook, `members-registration-${getTodayIsoDate()}.xlsx`);
}

export async function copyMembersForGoogleSheets(
  members: MemberRecord[]
): Promise<boolean> {
  const lines = [
    KHMER_HEADERS.join('\t'),
    ...members.map((member, index) =>
      [
        index + 1,
        member.id,
        member.fullName,
        member.gender,
        member.phone,
        member.telegram || '-',
        member.role,
        member.address || '-',
        member.dob || '-',
        member.joinDate,
      ]
        .map(sanitizeTsvCell)
        .join('\t')
    ),
  ];

  const tsvText = lines.join('\n');

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(tsvText);
      return true;
    } catch {
      // Fallback below when Clipboard API is restricted by iframe policy
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = tsvText;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function buildMemberQrPayload(member: MemberRecord): string {
  return [
    'ប្រព័ន្ធចុះឈ្មោះសមាជិក និងភ្ញៀវថ្មី',
    `ឈ្មោះពេញ: ${member.fullName}`,
    `ភេទ: ${member.gender}`,
    `លេខទូរសព្ទ: ${member.phone}`,
    `Telegram: ${member.telegram || '-'}`,
    `តួនាទី: ${member.role}`,
    `អាសយដ្ឋាន: ${member.address || '-'}`,
    `ថ្ងៃខែឆ្នាំកំណើត: ${member.dob || '-'}`,
    `កាលបរិច្ឆេទចុះឈ្មោះ: ${member.joinDate}`,
    `ID: ${member.id}`,
  ].join('\n');
}
