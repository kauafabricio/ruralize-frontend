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
        className={`inline-flex h-10 w-fit items-center gap-2 rounded-full px-6 text-[12px] font-black transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
          isFollowing
            ? "bg-secondary text-primary-dark hover:bg-accent hover:shadow-sm"
            : "bg-primary-dark text-white shadow-lg hover:bg-primary-dark-90 hover:shadow-xl"
        }`}
        title={isFollowing ? "Clique para deixar de seguir" : "Clique para seguir"}
      >
        {processing ? "Carregando..." : isFollowing ? "✓ Seguindo" : "Seguir"}
      </button>
    </>
  );
}
