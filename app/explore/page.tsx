"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import {
  getAllProfiles,
  searchProfilesByName,
  type UserProfileResponse,
} from "@/app/services/api/profile.api";
import { UserGrid } from "@/app/components/UserGrid";
import { Toast } from "@/app/components/Toast";

export default function ExplorePage() {
  return (
    <RequireAuth>
      <ExploreContent />
    </RequireAuth>
  );
}

function ExploreContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllProfiles();
      setUsers(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao carregar usuários";

      setError(message);

      setToast({
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await searchProfilesByName(searchTerm);
      setUsers(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao buscar usuários";

      setError(message);

      setToast({
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayTimer = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(delayTimer);
  }, [loadUsers]);

  useEffect(() => {
    const delayTimer = window.setTimeout(() => {
      if (searchTerm.trim()) {
        void searchUsers();
      } else {
        void loadUsers();
      }
    }, 500);

    return () => window.clearTimeout(delayTimer);
  }, [loadUsers, searchTerm, searchUsers]);

  return (
    <main className="min-h-screen bg-[#f4f6f1]">
      <FeedHeader />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto w-full max-w-[1132px] px-4 pb-16 pt-11 sm:px-6 lg:px-1">
        <section>
          <div className="mb-9">
            <h1 className="text-[30px] font-black leading-tight tracking-[-0.03em] text-[#1e261e]">
              Explorar Usuários
            </h1>

            <p className="mt-2 text-[13px] font-medium text-[#4f594c]">
              Descubra outros membros da comunidade Ruralize e conecte-se com
              pessoas que compartilham seus interesses.
            </p>

            <div className="mt-6">
              <div className="relative max-w-md">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7a8575]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Pesquisar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-full border border-[#d9e0d4] bg-white pl-12 pr-4 text-sm text-[#1e261e] shadow-sm outline-none transition focus:border-[#287630] focus:ring-2 focus:ring-[#287630]/20"
                />
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-[28px] bg-white px-6 py-8 text-center text-sm text-red-600 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
              {error}
            </div>
          ) : (
            <UserGrid users={users} loading={loading} />
          )}
        </section>
      </div>
    </main>
  );
}
