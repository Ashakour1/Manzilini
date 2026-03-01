"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuthStore } from "@/lib/store/auth.store";

type PersistApi = { hasHydrated?: () => boolean; onFinishHydration?: (cb: () => void) => () => void };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isHydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    const persist = (useAuthStore as { persist?: PersistApi }).persist;
    if (!persist) {
      setHydrated();
      return;
    }
    if (persist.hasHydrated?.()) {
      setHydrated();
      return;
    }
    const unsub = persist.onFinishHydration?.(() => setHydrated());
    return () => unsub?.();
  }, [setHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  const ready = isHydrated && !!token;

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
