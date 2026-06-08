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
            className="h-[320px] animate-pulse rounded-[22px] border border-[#e6efe4] bg-[#f4f5f0]"
          />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-[22px] border border-[#e6efe4] bg-[#fbfbf7] p-8 text-center">
        <p className="text-[13px] font-semibold text-[#545d50]">
          Nenhum usuário encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
