"use client";

import Link from "next/link";
import type { UserProfileResponse } from "@/app/services/api/profile.api";

export function UserCard({ user }: { user: UserProfileResponse }) {
  return (
    <Link
      href={`/perfil/${user.id}`}
      className="group overflow-hidden rounded-[22px] border border-[#e6efe4] bg-[#fbfbf7] p-5 transition hover:border-[#c7dabd] hover:bg-white"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#205f36] text-[12px] font-black text-white flex items-center justify-center">
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
          <p className="truncate text-[13px] font-black text-[#1e261e] group-hover:text-[#1f6f2a]">
            {user.name}
          </p>
          <p className="truncate text-[11px] font-semibold text-[#8a9186]">
            {user.role}
          </p>
        </div>
      </div>

      <div className="mb-4 space-y-1">
        {user.course && (
          <p className="text-[11px] text-[#687266]">
            <span className="font-black">Curso:</span> {user.course}
          </p>
        )}
        {user.department && (
          <p className="text-[11px] text-[#687266]">
            <span className="font-black">Depto:</span> {user.department}
          </p>
        )}
      </div>

      {user.description && (
        <p className="mb-4 text-[12px] leading-6 text-[#545d50]">
          {user.description}
        </p>
      )}

      {user.tags && user.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-[#e7f1df] px-2 py-1 text-[10px] font-semibold text-[#287630]"
            >
              #{tag}
            </span>
          ))}
          {user.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-[10px] font-semibold text-[#8a9186]">
              +{user.tags.length - 3}
            </span>
          )}
        </div>
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
