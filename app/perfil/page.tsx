"use client";

import { RequireAuth } from "../components/auth/RequireAuth";
import { useAuth } from "../components/auth/AuthProvider";
import { FeedHeader } from "../components/feed/FeedHeader";

export default function PerfilPage() {
  return (
    <RequireAuth>
      <PerfilContent />
    </RequireAuth>
  );
}

function PerfilContent() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email ?? "Usuario Ruralize";

  return (
    <main className="min-h-screen bg-[#f8f8f3] text-[#222a20]">
      <FeedHeader />

      <section className="mx-auto w-full max-w-[1132px] px-1 pb-16 pt-11">
        <div className="rounded-[28px] bg-white px-8 py-8 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#287630]">
            Perfil
          </p>
          <h1 className="mt-4 text-[28px] font-black tracking-[-0.03em] text-[#1f6f2a]">
            {displayName}
          </h1>
          {user?.email && (
            <p className="mt-2 text-[13px] font-semibold text-[#777f72]">
              {user.email}
            </p>
          )}
          {user?.role && (
            <p className="mt-5 inline-flex rounded-full bg-[#eef3e8] px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#287630]">
              {user.role}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
