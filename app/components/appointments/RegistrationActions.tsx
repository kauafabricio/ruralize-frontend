"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  hasRegistrationForm,
  readRegisteredEventSlugs,
  unregisterEvent,
} from "@/app/lib/eventRegistration";
import { RegistrationConfirmationModal } from "./RegistrationConfirmationModal";
import { RegistrationMissingFormModal } from "./RegistrationMissingFormModal";

type RegistrationActionsProps = {
  eventHref: string;
  eventSlug: string;
  formHref: string;
};

export function RegistrationActions({
  eventHref,
  eventSlug,
  formHref,
}: RegistrationActionsProps) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [missingFormOpen, setMissingFormOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const syncRegistrationTimeout = window.setTimeout(() => {
      setIsRegistered(readRegisteredEventSlugs().includes(eventSlug));
    }, 0);

    return () => {
      window.clearTimeout(syncRegistrationTimeout);
    };
  }, [eventSlug]);

  function handleCancelRegistration() {
    const confirmed = window.confirm(
      "Cancelar sua inscricao neste evento? Voce podera se inscrever novamente depois.",
    );

    if (!confirmed) {
      return;
    }

    unregisterEvent(eventSlug);
    setIsRegistered(false);
  }

  return (
    <>
      <div className="mt-7 space-y-4">
        {isRegistered ? (
          <div className="rounded-[18px] border border-[#c7e7c8] bg-[#f4fbf3] px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#287630]">
              Inscricao confirmada
            </p>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-[#566052]">
              Este evento ja aparece em Meus Agendamentos.
            </p>
          </div>
        ) : null}

        <Link
          href={formHref}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#b6d8b8] bg-white px-5 text-[12px] font-black text-[#287630] transition hover:bg-[#f4fbf3]"
        >
          <LinkIcon className="h-4 w-4" />
          Formulario de Inscricao
        </Link>
        <button
          type="button"
          onClick={() => {
            if (isRegistered) {
              return;
            }

            if (hasRegistrationForm(eventSlug)) {
              setConfirmationOpen(true);
              return;
            }

            setMissingFormOpen(true);
          }}
          disabled={isRegistered}
          className="h-12 w-full rounded-full bg-[#666a72] px-5 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(33,55,30,0.16)] transition hover:bg-[#555a61] disabled:opacity-60"
        >
          {isRegistered
            ? "Inscricao ja confirmada"
            : "Ja respondi o formulario, desejo avancar"}
        </button>
        {isRegistered ? (
          <button
            type="button"
            onClick={handleCancelRegistration}
            className="h-12 w-full rounded-full border border-[#f1c4c4] bg-white px-5 text-[12px] font-black text-[#b92828] transition hover:bg-[#fff3f3]"
          >
            Cancelar inscricao
          </button>
        ) : null}
      </div>

      {confirmationOpen ? (
        <RegistrationConfirmationModal
          eventHref={eventHref}
          eventSlug={eventSlug}
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
