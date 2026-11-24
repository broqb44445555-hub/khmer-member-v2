import { Lock, ShieldCheck } from 'lucide-react';

export interface MemberStats {
  total: number;
  male: number;
  female: number;
  today: number;
}

interface HeaderProps {
  isAdminUnlocked: boolean;
  stats: MemberStats;
  onAdminButtonClick: () => void;
}

export function Header({
  isAdminUnlocked,
  stats,
  onAdminButtonClick,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#0f4c5c] to-[#136f63] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-white leading-snug text-balance">
              ប្រព័ន្ធចុះឈ្មោះសមាជិក និងភ្ញៀវថ្មី
            </h1>
            <p className="mt-1 text-sm text-white/80 leading-relaxed">
              គ្រប់គ្រងព័ត៌មានសមាជិក រូបភាព និងការជូនដំណឹង Telegram ភ្លាមៗ
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onAdminButtonClick}
              className={`inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f4c5c] ${
                isAdminUnlocked
                  ? 'bg-white text-[#0f4c5c] hover:bg-white/90'
                  : 'bg-white/12 text-white border border-white/25 hover:bg-white/20'
              }`}
            >
              {isAdminUnlocked ? (
                <>
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Lock Admin</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Admin Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics bar — ONLY visible when Admin Mode is unlocked */}
        {isAdminUnlocked && (
          <div className="mt-6 pt-5 border-t border-white/15">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-y-4 md:gap-y-0 md:divide-x divide-white/15">
              <div className="pr-4">
                <dt className="text-xs sm:text-sm text-white/75 font-medium">
                  សរុប (Total)
                </dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {stats.total}
                </dd>
              </div>
              <div className="pl-2 md:pl-6 pr-4">
                <dt className="text-xs sm:text-sm text-white/75 font-medium">
                  ប្រុស (Male)
                </dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {stats.male}
                </dd>
              </div>
              <div className="pr-4 md:pl-6">
                <dt className="text-xs sm:text-sm text-white/75 font-medium">
                  ស្រី (Female)
                </dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {stats.female}
                </dd>
              </div>
              <div className="pl-2 md:pl-6">
                <dt className="text-xs sm:text-sm text-white/75 font-medium">
                  ថ្ងៃនេះ (Today)
                </dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {stats.today}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </header>
  );
}
