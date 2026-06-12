"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/app/components/auth/AuthProvider";
import { subscribeEvent, getEventParticipants } from "@/app/services/api/events.api";

type RegistrationConfirmationModalProps = {
  eventHref: string;
  eventId: string;
  registrationData: Record<string, unknown>;
  onClose: () => void;
};

export function RegistrationConfirmationModal({
  eventHref,
  eventId,
  registrationData,
  onClose,
}: RegistrationConfirmationModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!user?.id) {
      setError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Inscrever
      await subscribeEvent(eventId, registrationData);

      // 2. Recarregar participantes para validar
      const participants = await getEventParticipants(eventId);
      const isSubscribed = participants.some((p) => p.user_id === user.id);

      if (!isSubscribed) {
        throw new Error("Inscrição não foi confirmada pelo servidor. Tente novamente.");
      }

      // 3. Notificar e redirecionar
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("events:updated", { detail: { eventId } })
        );
      }
      router.push("/agendamentos");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao confirmar inscrição"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#d7ddd3]/70 px-4 py-8 backdrop-blur-[5px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-confirmation-title"
        className="w-full max-w-[356px] rounded-[24px] bg-white px-8 pb-8 pt-9 text-center shadow-[0_24px_50px_rgba(33,55,30,0.22)]"
      >
        <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#eef8ea] text-[#287630]">
          <LeafIcon className="h-8 w-8" />
        </div>

        <h2
          id="registration-confirmation-title"
          className="mt-7 text-[22px] font-black tracking-[-0.04em] text-[#287630]"
        >
          Quase lá!
        </h2>
        <p className="mx-auto mt-3 max-w-[230px] text-[12px] font-semibold leading-5 text-[#4f594c]">
          Você preencheu o formulário de inscrição corretamente?
        </p>

        {error ? (
          <div className="mt-4 rounded-[14px] bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#287630] px-5 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.2)] transition hover:bg-[#1f6428] disabled:opacity-50"
          >
            {loading ? "Confirmando..." : "Sim, preenchi corretamente"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-full bg-[#676a72] px-5 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(33,55,30,0.14)] transition hover:bg-[#555a61]"
          >
            Não, voltar ao formulário
          </button>
        </div>
      </section>
    </div>
  );
}

function LeafIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 21c8 0 14-6 14-14V3h-4C7 3 3 8 3 14c0 3 2 5 5 5" />
      <path d="M9 15c2-4 5-6 10-8" />
    </svg>
  );
}

