import { useCallback, useMemo, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { Header } from './components/Header';
import type { MemberStats } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { SuccessModal } from './components/SuccessModal';
import { getTodayIsoDate } from './config/portalConfig';
import {
  deleteMemberRecord,
  fetchAllMembers,
} from './services/registrationService';
import type { MemberRecord, RegistrationSubmitStatus } from './types/member';

export default function App() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submitStatus, setSubmitStatus] =
    useState<RegistrationSubmitStatus | null>(null);

  const loadMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    setLoadError(null);
    try {
      const result = await fetchAllMembers();
      setMembers(result.members);
      setLoadError(result.error ?? null);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  const handleAdminButtonClick = () => {
    if (isAdminUnlocked) {
      setIsAdminUnlocked(false);
      setMembers([]);
      setLoadError(null);
    } else {
      setIsPasscodeModalOpen(true);
    }
  };

  const handleUnlockAdmin = () => {
    setIsPasscodeModalOpen(false);
    setIsAdminUnlocked(true);
    void loadMembers();
  };

  const handleRegistrationSuccess = (status: RegistrationSubmitStatus) => {
    setSubmitStatus(status);
    if (isAdminUnlocked) {
      setMembers((prev) => [
        status.record,
        ...prev.filter((item) => item.id !== status.record.id),
      ]);
    }
  };

  const handleDeleteMember = async (id: number) => {
    await deleteMemberRecord(id);
    setMembers((prev) => prev.filter((item) => item.id !== id));
  };

  const stats: MemberStats = useMemo(() => {
    const todayIso = getTodayIsoDate();
    let male = 0;
    let female = 0;
    let today = 0;

    for (const member of members) {
      if (member.gender === 'ប្រុស') male += 1;
      else if (member.gender === 'ស្រី') female += 1;
      if (member.joinDate === todayIso) today += 1;
    }

    return {
      total: members.length,
      male,
      female,
      today,
    };
  }, [members]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f7] text-[#112429]">
      <Header
        isAdminUnlocked={isAdminUnlocked}
        stats={stats}
        onAdminButtonClick={handleAdminButtonClick}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-8">
        <div className={isAdminUnlocked ? 'max-w-5xl mx-auto' : 'max-w-4xl mx-auto'}>
          <RegistrationForm onSuccess={handleRegistrationSuccess} />
        </div>

        {isAdminUnlocked && (
          <AdminDashboard
            members={members}
            isLoading={isLoadingMembers}
            loadError={loadError}
            onRefresh={loadMembers}
            onDeleteMember={handleDeleteMember}
          />
        )}
      </main>

      <footer className="py-5 px-4 text-center text-xs text-slate-400 border-t border-slate-200/70 bg-white/60">
        ប្រព័ន្ធចុះឈ្មោះសមាជិក និងភ្ញៀវថ្មី
      </footer>

      <AdminPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onUnlock={handleUnlockAdmin}
      />

      <SuccessModal
        status={submitStatus}
        onClose={() => setSubmitStatus(null)}
      />
    </div>
  );
}
