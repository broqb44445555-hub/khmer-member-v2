export type Gender = 'ប្រុស' | 'ស្រី';

export type GenderFilter = 'ទាំងអស់' | Gender;

export interface MemberRecord {
  id: number;
  fullName: string;
  gender: Gender;
  phone: string;
  telegram: string;
  role: string;
  address: string;
  dob: string;
  joinDate: string;
  photo: string;
}

export interface CompressedPhotoResult {
  telegramBlob: Blob;
  previewUrl: string;
  sheetsThumbnail: string;
  telegramSizeKb: number;
  thumbnailSizeKb: number;
}

export interface RegistrationSubmitStatus {
  record: MemberRecord;
  telegramSentCount: number;
  telegramTotalCount: number;
  sheetsSynced: boolean;
  usedLocalFallback: boolean;
}
