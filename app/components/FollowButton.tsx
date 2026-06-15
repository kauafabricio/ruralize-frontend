"use client";

import { useState } from "react";
import { Toast } from "./Toast";

export function FollowButton({
  isFollowing = false,
  onFollowToggle,
  disabled = false,
}: {
  isFollowing?: boolean;
  onFollowToggle?: () => Promise<void>;
  disabled?: boolean;
}) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleClick() {
    if (!onFollowToggle) {
      setToastMessage("Esta funcionalidade estará disponível em breve.");
      setShowToast(true);
      return;
    }

    setProcessing(true);
    try {
      await onFollowToggle();
    } catch (error) {
      setToastMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o estado de seguir",
      );
      setShowToast(true);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      {showToast && toastMessage ? (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => {
            setShowToast(false);
            setToastMessage(null);
          }}
        />
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || processing}
        className={`inline-flex h-10 px-6 items-center gap-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          isFollowing
            ? "bg-secondary-light/30 text-primary-dark border border-pastel-support/40 hover:bg-secondary-light/50"
            : "bg-primary-dark text-white shadow-soft hover:opacity-95 active:scale-[0.98]"
        }`}
        title={isFollowing ? "Clique para deixar de seguir" : "Clique para seguir"}
      >
        {processing ? "Carregando..." : isFollowing ? "✓ Seguindo" : "Seguir"}
      </button>
    </>
  );
}
