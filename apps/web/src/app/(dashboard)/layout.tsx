'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { useAuthStore } from '@/store/auth';
import { getAccessToken, refreshToken, startSilentRefresh, stopSilentRefresh } from '@/lib/api';

import { Header } from '@/components/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clear);
  const [hydrating, setHydrating] = useState(true);

  // On mount: ensure valid token is present in memory, or silently refresh from cookie
  useEffect(() => {
    if (!getAccessToken()) {
      refreshToken()
        .then((result) => {
          if (result) {
            setUser(result.user as any);
          } else {
            clearAuth();
            router.push('/login');
          }
        })
        .catch(() => {
          clearAuth();
          router.push('/login');
        })
        .finally(() => setHydrating(false));
    } else {
      setHydrating(false);
    }
    startSilentRefresh();
    return () => stopSilentRefresh();
  }, [router, setUser, clearAuth]);

  if (hydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf6ed]">
        <div className="text-[#a66d2e] font-serif text-sm tracking-widest uppercase animate-pulse">
          Loading Shree Jewellers...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fbf6ed] text-[#28231e] print:block print:bg-white print:min-h-0">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0 print:block print:w-full">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible print:w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
