"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers();
      } else {
        loadUsers();
      }
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [searchTerm]);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllProfiles();
      setUsers(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar usuários";
      setError(message);
      setToast({
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers() {
    setLoading(true);
    setError(null);

    try {
      const data = await searchProfilesByName(searchTerm);
      setUsers(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao buscar usuários";
      setError(message);
      setToast({
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f3] text-[#222a20]">
      <FeedHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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
              Descubra outros membros da comunidade Ruralize e conecte-se com pessoas que compartilham seus interesses.
            </p>
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
