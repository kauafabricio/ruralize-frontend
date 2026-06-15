"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuthenticatedUser } from "../auth/useAuthenticatedUser";
import {
  getEventParticipants,
  unsubscribeEvent,
  updateParticipantStatus,
} from "@/app/services/api/events.api";

type RegistrationActionsProps = {
  eventId: string;
  formHref: string;
  promoterId?: string;
  startDate: string;
  endDate: string;
};

export function RegistrationActions({
  eventId,
  formHref,
  promoterId,
  startDate,
  endDate,
}: RegistrationActionsProps) {
  const user = useAuthenticatedUser();
  const [isRegistered, setIsRegistered] = useState(false);
  const [participants, setParticipants] = useState<{ user_id: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrationClosed = useMemo(() => {
    const now = new Date();
    const start = new Date(startDate);
    return now >= start;
  }, [startDate]);

  const canManageAttendance = useMemo(
    () => Boolean(user?.userId && promoterId && user.userId === promoterId),
    [user, promoterId],
  );

  const isEventOver = useMemo(() => {
    const now = new Date();
    const end = new Date(endDate);
    return now >= end;
  }, [endDate]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const loadParticipants = async () => {
      try {
        const list = await getEventParticipants(eventId);
        setParticipants(list.map((participant) => ({
          user_id: participant.user_id ?? "",
          status:
            typeof participant.status === "string"
              ? participant.status
              : "subscribed",
        })));

        if (user?.userId) {
          setIsRegistered(
            list.some((participant) => participant.user_id === user.userId),
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar participantes");
      }
    };

    loadParticipants();
  }, [eventId, user?.userId]);


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
      await unsubscribeEvent(eventId);
      // reload participants to ensure UI reflects server state
      const list = await getEventParticipants(eventId);
      setParticipants(list.map((participant) => ({
        user_id: participant.user_id ?? "",
        status: typeof participant.status === "string" ? participant.status : "subscribed",
      })));
      if (user?.userId) setIsRegistered(list.some((p) => p.user_id === user.userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar inscrição");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkParticipant = async (participantId: string, status: string) => {
    if (!canManageAttendance || !user?.userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateParticipantStatus(eventId, participantId, status);
      setParticipants((current) =>
        current.map((participant) =>
          participant.user_id === participantId
            ? { ...participant, status }
            : participant,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar presença");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-7 space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isRegistered ? (
        <div className="rounded-xl border border-[#c7e7c8] bg-white px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-dark">
            Inscrição confirmada
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-neutral-darker">
            Este evento já aparece em Meus Agendamentos.
          </p>
        </div>
      ) : null}

      <Link
        href={formHref}
        className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#b6d8b8] bg-white px-5 text-xs font-bold text-primary-dark transition hover:bg-white"
      >
        <LinkIcon className="h-4 w-4" />
        Formulário de Inscrição
      </Link>

      {!isRegistered && (
        <Link
          href={formHref}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary-dark px-5 text-xs font-bold text-white shadow-soft transition hover:bg-primary-darker"
        >
          Confirmar inscrição
        </Link>
      )}

      {isRegistered && (
        <button
          type="button"
          onClick={handleCancelRegistration}
          disabled={loading}
          className="h-12 w-full rounded-full border border-pastel-support bg-white px-5 text-xs font-bold text-danger-primary transition hover:bg-danger-light disabled:opacity-60"
        >
          {loading ? "Processando..." : "Cancelar inscrição"}
        </button>
      )}

      {registrationClosed && !isRegistered ? (
        <div className="rounded-xl border border-[#f0ead7] bg-white">
          As inscrições foram bloqueadas pois o evento já começou.
        </div>
      ) : null}

      {canManageAttendance ? (
        <section className="rounded-xl border border-[#d8e7d4] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary-dark">
            Gerenciar Presença
          </p>
          {participants.length === 0 ? (
            <p className="mt-3 text-xs text-neutral-darker">
              Nenhum participante inscrito ainda.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.user_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-pastel-support bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-xs font-bold text-neutral-darker">
                      {participant.user_id}
                    </p>
                    <p className="text-xs text-neutral-darker">
                      Status: {participant.status}
                    </p>
                  </div>
                  {isEventOver ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarkParticipant(participant.user_id, "attended")}
                        disabled={loading || participant.status === "attended"}
                        className="rounded-full bg-primary-dark px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-darker disabled:opacity-50"
                      >
                        Marcar Presente
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkParticipant(participant.user_id, "missed")}
                        disabled={loading || participant.status === "missed"}
                        className="rounded-full border border-pastel-support bg-white px-3 py-2 text-xs font-bold text-danger-primary transition hover:bg-danger-light disabled:opacity-50"
                      >
                        Marcar Faltou
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-darker">
                      A presença poderá ser marcada após o término do evento.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
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
