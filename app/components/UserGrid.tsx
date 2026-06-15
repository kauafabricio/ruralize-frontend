"use client";

import type { UserProfileResponse } from "@/app/services/api/profile.api";
import { UserCard } from "./UserCard";

export function UserGrid({ users, loading }: { users: UserProfileResponse[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[280px] animate-pulse rounded-2xl border border-pastel-support/20 bg-neutral-light"
          />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-pastel-support/30 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-neutral-muted">
          Nenhum usuário encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
