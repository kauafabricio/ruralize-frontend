"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuthenticatedUser } from "../auth/useAuthenticatedUser";
import { subscribeEvent, unsubscribeEvent } from "@/app/services/api/events.api";
import {
  hasRegistrationForm,
  saveRegistrationForm,
} from "@/app/lib/eventRegistration";
import { RegistrationConfirmationModal } from "./RegistrationConfirmationModal";
import { RegistrationMissingFormModal } from "./RegistrationMissingFormModal";

type RegistrationActionsProps = {
  eventId: string;
  eventHref: string;
  formHref: string;
};

export function RegistrationActions({
  eventId,
  eventHref,
  formHref,
}: RegistrationActionsProps) {
  const user = useAuthenticatedUser();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [missingFormOpen, setMissingFormOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is registered (simplified - assumes form has been filled)
  useEffect(() => {
    if (!eventId) return;
    const syncRegistrationTimeout = window.setTimeout(() => {
      setIsRegistered(hasRegistrationForm(eventId));
    }, 0);

    return () => {
      window.clearTimeout(syncRegistrationTimeout);
    };
  }, [eventId]);

  const handleSubscribe = async () => {
    if (!user || !user.userId) {
      setError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await subscribeEvent(eventId, user.userId as string);
      setIsRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao se inscrever");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user || !user.userId) {
      setError("Usuário não autenticado");
      return;
    }

    const confirmed = window.confirm(
      "Cancelar sua inscrição neste evento? Você poderá se inscrever novamente depois."
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      await unsubscribeEvent(eventId, user.userId as string);
      setIsRegistered(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar inscrição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-7 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isRegistered ? (
          <div className="rounded-[18px] border border-[#c7e7c8] bg-[#f4fbf3] px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#287630]">
              Inscrição confirmada
            </p>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-[#566052]">
              Este evento já aparece em Meus Agendamentos.
            </p>
          </div>
        ) : null}

        <Link
          href={formHref}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#b6d8b8] bg-white px-5 text-[12px] font-black text-[#287630] transition hover:bg-[#f4fbf3]"
        >
          <LinkIcon className="h-4 w-4" />
          Formulário de Inscrição
        </Link>

        <button
          type="button"
          onClick={() => {
            if (isRegistered) {
              return;
            }

            if (hasRegistrationForm(eventId)) {
              handleSubscribe();
              return;
            }

            setMissingFormOpen(true);
          }}
          disabled={isRegistered || loading}
          className="h-12 w-full rounded-full bg-[#287630] px-5 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(33,55,30,0.16)] transition hover:bg-[#1f6428] disabled:opacity-60"
        >
          {loading
            ? "Processando..."
            : isRegistered
              ? "Inscrição já confirmada"
              : "Já respondi o formulário, desejo avançar"}
        </button>

        {isRegistered ? (
          <button
            type="button"
            onClick={handleCancelRegistration}
            disabled={loading}
            className="h-12 w-full rounded-full border border-[#f1c4c4] bg-white px-5 text-[12px] font-black text-[#b92828] transition hover:bg-[#fff3f3] disabled:opacity-60"
          >
            {loading ? "Processando..." : "Cancelar inscrição"}
          </button>
        ) : null}
      </div>

      {confirmationOpen ? (
        <RegistrationConfirmationModal
          eventId={eventId}
          eventHref={eventHref}
          registerOnConfirm
          onClose={() => setConfirmationOpen(false)}
        />
      ) : null}

      {missingFormOpen ? (
        <RegistrationMissingFormModal
          formHref={formHref}
          onClose={() => setMissingFormOpen(false)}
        />
      ) : null}
    </>
  );
}

function LinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
    </svg>
  );
}
