import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Camera, Loader2, Send, Trash2 } from 'lucide-react';
import { getTodayIsoDate } from '../config/portalConfig';
import { submitMemberRegistration } from '../services/registrationService';
import type {
  CompressedPhotoResult,
  Gender,
  RegistrationSubmitStatus,
} from '../types/member';
import { compressUploadedPhoto } from '../utils/imageCompression';
import { SuitPersonAvatar } from './SuitPersonAvatar';

interface RegistrationFormProps {
  onSuccess: (status: RegistrationSubmitStatus) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('ប្រុស');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [role, setRole] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [joinDate, setJoinDate] = useState(getTodayIsoDate);

  const [photoData, setPhotoData] = useState<CompressedPhotoResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('សូមជ្រើសរើសឯកសាររូបភាពតែប៉ុណ្ណោះ (JPG, PNG, WebP)។');
      return;
    }

    setFormError(null);
    setIsCompressing(true);
    try {
      const compressed = await compressUploadedPhoto(file);
      setPhotoData(compressed);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'មានបញ្ហាក្នុងការដំណើរការរូបភាព សូមសាកល្បងម្ដងទៀត។'
      );
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFullName('');
    setGender('ប្រុស');
    setPhone('');
    setTelegram('');
    setRole('');
    setAddress('');
    setDob('');
    setJoinDate(getTodayIsoDate());
    setPhotoData(null);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedRole = role.trim();

    if (!trimmedName || !trimmedPhone || !trimmedRole) {
      setFormError(
        'សូមបំពេញប្រឡោះចាំបាច់ទាំងអស់ (ឈ្មោះពេញ, លេខទូរសព្ទ និងតួនាទី)។'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitMemberRegistration(
        {
          fullName: trimmedName,
          gender,
          phone: trimmedPhone,
          telegram: telegram.trim(),
          role: trimmedRole,
          address: address.trim(),
          dob,
          joinDate: joinDate || getTodayIsoDate(),
          photo: photoData?.sheetsThumbnail ?? '',
        },
        photoData?.telegramBlob ?? null
      );

      resetForm();
      onSuccess(result);
    } catch {
      setFormError('មានបញ្ហាបច្ចេកទេសក្នុងការផ្ញើទិន្នន័យ សូមសាកល្បងម្ដងទៀត។');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    'w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-300/90 text-[15px] text-[#112429] placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:border-[#136f63] focus:ring-2 focus:ring-[#136f63]/20';

  return (
    <section
      aria-labelledby="registration-form-heading"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,76,92,0.04)] overflow-hidden"
    >
      <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-slate-100">
        <h2
          id="registration-form-heading"
          className="text-lg sm:text-xl font-bold text-[#0f4c5c]"
        >
          ទម្រង់ចុះឈ្មោះសមាជិក និងភ្ញៀវថ្មី
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          សូមបំពេញព័ត៌មានខាងក្រោមឲ្យបានត្រឹមត្រូវ។ ប្រឡោះដែលមានសញ្ញា{' '}
          <span className="text-rose-600 font-semibold">*</span> ជាព័ត៌មានចាំបាច់។
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-8" noValidate>
        {/* Photo Upload Zone */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-7 mb-7 border-b border-slate-100">
          <div className="relative">
            <SuitPersonAvatar
              src={photoData?.previewUrl}
              alt="រូបភាពសមាជិក"
              size="xl"
              className="ring-4 ring-[#0f4c5c]/8"
            />
            {isCompressing && (
              <div className="absolute inset-0 rounded-full bg-white/80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#0f4c5c] animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-sm font-semibold text-[#112429]">
              រូបភាពសមាជិក / ភ្ញៀវ (មិនចាំបាច់)
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              ប្រព័ន្ធនឹងបង្ហាប់រូបភាពដោយស្វ័យប្រវត្តិសម្រាប់ផ្ញើទៅ Telegram និងរក្សាទុកក្នុង Google Sheets
            </p>

            <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <input
                ref={fileInputRef}
                id="member-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
              <button
                type="button"
                disabled={isCompressing || isSubmitting}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl border border-[#0f4c5c]/25 bg-[#f4f7f7] text-[#0f4c5c] text-sm font-medium hover:bg-[#e8f0f1] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136f63]"
              >
                <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>ជ្រើសរើសរូបភាព</span>
              </button>

              {photoData && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-xl text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>ដករូបភាពចេញ</span>
                </button>
              )}
            </div>

            {photoData && (
              <p className="mt-2 text-xs text-[#136f63] tabular-nums">
                បានបង្ហាប់រួចរាល់ · Telegram {photoData.telegramSizeKb} KB · Sheets{' '}
                {photoData.thumbnailSizeKb} KB
              </p>
            )}
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* 1. Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-[#112429] mb-1.5"
            >
              ឈ្មោះពេញ <span className="text-rose-600">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ឧ. សុខ ដារ៉ា"
              className={inputClassName}
            />
          </div>

          {/* 2. Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-[#112429] mb-1.5"
            >
              ភេទ <span className="text-rose-600">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              required
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className={inputClassName}
            >
              <option value="ប្រុស">ប្រុស</option>
              <option value="ស្រី">ស្រី</option>
            </select>
          </div>

          {/* 3. Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-[#112429] mb-1.5"
            >
              លេខទូរសព្ទ <span className="text-rose-600">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="012 345 678"
              className={`${inputClassName} tabular-nums`}
            />
          </div>

          {/* 4. Telegram */}
          <div>
            <label
              htmlFor="telegram"
              className="block text-sm font-medium text-[#112429] mb-1.5"
            >
              Telegram (មិនចាំបាច់)
            </label>
            <input
              id="telegram"
              name="telegram"
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username"
              className={inputClassName}
            />
          </div>

          {/* 5. Role / Guest Type */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-[#112429] mb-1.5"
            >
              តួនាទី / ប្រភេទភ្ញៀវ <span className="text-rose-600">*</span>
            </label>
            <input
              id="role"
              name="role"
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="ឧ. សមាជិកថ្មី ឬ ភ្ញៀវកិត្តិយស"
              className={inputClassName}
            />
          </div>

          {/* 6. Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-[#112429] mb-1.5"
            >
              អាសយដ្ឋាន
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ឧ. ភូមិ ឃុំ ស្រុក ខេត្ត"
              className={inputClassName}
            />
          </div>

          {/* 7. Date of Birth */}
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-[#112429] mb-1.5"
            >
              ថ្ងៃខែឆ្នាំកំណើត
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={`${inputClassName} tabular-nums`}
            />
          </div>

          {/* 8. Registration Date */}
          <div>
            <label
              htmlFor="joinDate"
              className="block text-sm font-medium text-[#112429] mb-1.5"
            >
              កាលបរិច្ឆេទចុះឈ្មោះ
            </label>
            <input
              id="joinDate"
              name="joinDate"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className={`${inputClassName} tabular-nums`}
            />
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="mt-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800"
          >
            {formError}
          </div>
        )}

        <div className="mt-7 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isCompressing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 min-h-[48px] px-7 py-3 rounded-xl bg-gradient-to-r from-[#0f4c5c] to-[#136f63] hover:brightness-105 active:scale-[0.99] text-white text-[15px] font-semibold shadow-sm transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#136f63] focus-visible:ring-offset-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
                <span>កំពុងផ្ញើទិន្នន័យ...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>ចុះឈ្មោះ និងផ្ញើទៅ Telegram</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
