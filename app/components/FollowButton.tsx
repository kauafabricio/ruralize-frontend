"use client";

import { useState } from "react";
import { Toast } from "./Toast";

export function FollowButton({
  isFollowing = false,
  onFollowToggle,
}: {
  isFollowing?: boolean;
  onFollowToggle?: () => void;
}) {
  const [showToast, setShowToast] = useState(false);

  function handleClick() {
    setShowToast(true);
  }

  return (
    <>
      {showToast && (
        <Toast
          message="Esta funcionalidade estará disponível em breve. O sistema de seguir está em desenvolvimento."
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex h-10 w-fit items-center gap-2 rounded-full px-6 text-[12px] font-black transition-colors ${
          isFollowing
            ? "bg-[#e7f1df] text-[#287630] hover:bg-[#d0e5c2]"
            : "bg-[#287630] text-white shadow-[0_10px_18px_rgba(40,118,48,0.12)] hover:bg-[#1f6428]"
        }`}
        title="Esta funcionalidade estará disponível em breve"
      >
        {isFollowing ? "✓ Seguindo" : "Seguir"}
      </button>
    </>
  );
}
