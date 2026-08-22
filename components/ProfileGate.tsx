"use client";

import { useProgress } from "@/context/ProgressProvider";
import { ProfilePicker } from "@/components/ProfilePicker";
import { Header } from "@/components/Header";

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { isReady, activeProfile } = useProgress();

  if (!isReady) {
    return null;
  }

  if (!activeProfile) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <ProfilePicker />
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
