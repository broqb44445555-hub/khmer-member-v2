import {
  GOOGLE_APPS_SCRIPT_URL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_IDS,
  isAppsScriptConfigured,
} from '../config/portalConfig';
import type {
  Gender,
  MemberRecord,
  RegistrationSubmitStatus,
} from '../types/member';

const LOCAL_STORAGE_KEY = 'khmer_member_portal_records_v1';

function normalizeGender(value: unknown): Gender {
  return value === 'ស្រី' ? 'ស្រី' : 'ប្រុស';
}

function normalizeRecord(raw: Record<string, unknown>, fallbackIndex = 0): MemberRecord {
  const numericId = Number(raw.id);
  return {
    id: Number.isFinite(numericId) && numericId > 0 ? numericId : Date.now() + fallbackIndex,
    fullName: String(raw.fullName ?? raw.full_name ?? raw.name ?? '').trim(),
    gender: normalizeGender(raw.gender),
    phone: String(raw.phone ?? '').trim(),
    telegram: String(raw.telegram ?? '').trim(),
    role: String(raw.role ?? '').trim(),
    address: String(raw.address ?? '').trim(),
    dob: String(raw.dob ?? '').trim(),
    joinDate: String(raw.joinDate ?? raw.join_date ?? '').trim(),
    photo: String(raw.photo ?? '').trim(),
  };
}

function readLocalRecords(): MemberRecord[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item, idx) => normalizeRecord(item, idx))
      .sort((a, b) => b.id - a.id);
  } catch {
    return [];
  }
}

function writeLocalRecords(records: MemberRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota issues when offline fallback is full
  }
}

export function formatTelegramCaption(record: MemberRecord): string {
  const telegramDisplay = record.telegram ? record.telegram : 'គ្មាន';
  const addressDisplay = record.address ? record.address : 'គ្មាន';
  const dobDisplay = record.dob ? record.dob : 'គ្មាន';

  return [
    '📋 ការចុះឈ្មោះសមាជិក / ភ្ញៀវថ្មី',
    '────────────────────',
    `👤 ឈ្មោះពេញ: ${record.fullName}`,
    `⚧ ភេទ: ${record.gender}`,
    `📞 លេខទូរសព្ទ: ${record.phone}`,
    `✈️ Telegram: ${telegramDisplay}`,
    `🏷️ តួនាទី / ប្រភេទភ្ញៀវ: ${record.role}`,
    `📍 អាសយដ្ឋាន: ${addressDisplay}`,
    `🎂 ថ្ងៃខែឆ្នាំកំណើត: ${dobDisplay}`,
    `📅 កាលបរិច្ឆេទចុះឈ្មោះ: ${record.joinDate}`,
  ].join('\n');
}

async function sendToSingleChat(
  chatId: string,
  caption: string,
  highQualityPhotoBlob: Blob | null
): Promise<boolean> {
  try {
    if (highQualityPhotoBlob) {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', highQualityPhotoBlob, `member-${Date.now()}.jpg`);
      formData.append('caption', caption);

      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        {
          method: 'POST',
          body: formData,
        }
      );
      return response.ok;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: caption,
        }),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function sendTelegramNotifications(
  record: MemberRecord,
  highQualityPhotoBlob: Blob | null
): Promise<{ sentCount: number; totalCount: number }> {
  const caption = formatTelegramCaption(record);
  const results = await Promise.allSettled(
    TELEGRAM_CHAT_IDS.map((chatId) =>
      sendToSingleChat(chatId, caption, highQualityPhotoBlob)
    )
  );

  const sentCount = results.filter(
    (result) => result.status === 'fulfilled' && result.value === true
  ).length;

  return {
    sentCount,
    totalCount: TELEGRAM_CHAT_IDS.length,
  };
}

export async function submitMemberRegistration(
  payload: Omit<MemberRecord, 'id'>,
  highQualityPhotoBlob: Blob | null
): Promise<RegistrationSubmitStatus> {
  const record: MemberRecord = {
    id: Date.now(),
    ...payload,
  };

  // Run dual Telegram notification and Google Apps Script POST concurrently
  const telegramPromise = sendTelegramNotifications(record, highQualityPhotoBlob);

  let sheetsSynced = false;
  let usedLocalFallback = false;

  const sheetsPromise = (async () => {
    if (isAppsScriptConfigured()) {
      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            id: record.id,
            fullName: record.fullName,
            gender: record.gender,
            phone: record.phone,
            telegram: record.telegram,
            role: record.role,
            address: record.address,
            dob: record.dob,
            joinDate: record.joinDate,
            photo: record.photo,
          }),
        });
        sheetsSynced = response.ok || response.type === 'opaque';
      } catch {
        sheetsSynced = false;
      }
    } else {
      usedLocalFallback = true;
    }

    // Always store locally as immediate backup / preview store
    const existing = readLocalRecords();
    const deduplicated = [record, ...existing.filter((item) => item.id !== record.id)];
    writeLocalRecords(deduplicated);
  })();

  const [telegramResult] = await Promise.all([telegramPromise, sheetsPromise]);

  return {
    record,
    telegramSentCount: telegramResult.sentCount,
    telegramTotalCount: telegramResult.totalCount,
    sheetsSynced,
    usedLocalFallback,
  };
}

export async function fetchAllMembers(): Promise<{
  members: MemberRecord[];
  source: 'sheets' | 'local';
  error?: string;
}> {
  if (!isAppsScriptConfigured()) {
    return {
      members: readLocalRecords(),
      source: 'local',
    };
  }

  try {
    const separator = GOOGLE_APPS_SCRIPT_URL.includes('?') ? '&' : '?';
    const response = await fetch(
      `${GOOGLE_APPS_SCRIPT_URL}${separator}_t=${Date.now()}`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rawData: unknown = await response.json();
    let list: unknown[] = [];

    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (rawData && typeof rawData === 'object') {
      const container = rawData as Record<string, unknown>;
      if (Array.isArray(container.data)) list = container.data;
      else if (Array.isArray(container.members)) list = container.members;
      else if (Array.isArray(container.records)) list = container.records;
      else if (Array.isArray(container.rows)) list = container.rows;
    }

    const members = list
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item, idx) => normalizeRecord(item, idx))
      .filter((item) => item.fullName.length > 0 || item.phone.length > 0)
      .sort((a, b) => b.id - a.id);

    writeLocalRecords(members);
    return { members, source: 'sheets' };
  } catch {
    return {
      members: readLocalRecords(),
      source: 'local',
      error: 'មិនអាចទាញទិន្នន័យពី Google Sheets បានទេ — កំពុងបង្ហាញទិន្នន័យបម្រុងក្នុងឧបករណ៍។',
    };
  }
}

export async function deleteMemberRecord(id: number): Promise<boolean> {
  let remoteDeleted = true;

  if (isAppsScriptConfigured()) {
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'delete',
          id,
        }),
      });
      remoteDeleted = response.ok || response.type === 'opaque';
    } catch {
      remoteDeleted = false;
    }
  }

  const remaining = readLocalRecords().filter((item) => item.id !== id);
  writeLocalRecords(remaining);
  return remoteDeleted;
}
