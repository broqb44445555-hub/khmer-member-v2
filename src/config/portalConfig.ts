export const TELEGRAM_BOT_TOKEN =
  (import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string | undefined) ||
  '9191309203:AAEm-_I9cjuCvGVnefdXCDazYhvbX3XCVbs';

export const TELEGRAM_CHAT_IDS = ['6992529628', '8468559961'] as const;

export const GOOGLE_APPS_SCRIPT_URL =
  (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL as string | undefined) ||
  'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

export const ADMIN_PASSCODE = '1234';

export function isAppsScriptConfigured(): boolean {
  const url = GOOGLE_APPS_SCRIPT_URL.trim();
  return (
    url.length > 0 &&
    url !== 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' &&
    /^https?:\/\//i.test(url)
  );
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
