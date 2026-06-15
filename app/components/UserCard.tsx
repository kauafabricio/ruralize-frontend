"use client";

import Link from "next/link";
import type { UserProfileResponse } from "@/app/services/api/profile.api";

export function UserCard({ user }: { user: UserProfileResponse }) {
  return (
    <Link
      href={`/perfil/${user.id}`}
      className="group overflow-hidden rounded-2xl border border-pastel-support/30 bg-white p-5 transition-all duration-200 hover:border-pastel-support/60 hover:shadow-soft"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary-dark text-xs font-bold text-white flex items-center justify-center">
          {user.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profile_photo_url}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            readInitials(user.name)
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-neutral-darker group-hover:text-primary-dark transition-colors">
            {user.name}
          </p>
          <p className="truncate text-xs font-semibold text-neutral-muted">
            {user.role}
          </p>
        </div>
      </div>

      {user.department && (
        <div className="mb-4">
          <p className="text-xs text-neutral-muted">
            <span className="font-bold">Depto:</span> {user.department}
          </p>
        </div>
      )}

      {user.description && (
        <p className="text-xs leading-relaxed text-neutral-muted">
          {user.description}
        </p>
      )}
    </Link>
  );
}

function readInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "R";
}
