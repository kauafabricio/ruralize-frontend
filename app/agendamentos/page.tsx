"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { useAuthenticatedUser } from "@/app/components/auth/useAuthenticatedUser";
import { getMyEvents, EventResponse, unsubscribeEvent } from "@/app/services/api/events.api";

export default function AgendamentosPage() {
  const user = useAuthenticatedUser();
  const [registeredEvents, setRegisteredEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's events from backend
  useEffect(() => {
    if (!user || !user.userId) return;

    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyEvents();
        setRegisteredEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar agendamentos");
        setRegisteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user?.userId]);

  // Listen for events:updated event to refresh the list
  useEffect(() => {
    const handleEventsUpdated = () => {
      if (!user || !user.userId) return;

      const fetchMyEvents = async () => {
        try {
          const data = await getMyEvents();
          setRegisteredEvents(data);
        } catch (err) {
          console.error("Erro ao recarregar agendamentos:", err);
        }
      };

      fetchMyEvents();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("events:updated", handleEventsUpdated);
      return () => window.removeEventListener("events:updated", handleEventsUpdated);
    }
  }, [user?.userId]);

  const handleCancel = async (eventId: string, eventTitle: string) => {
    const confirmed = window.confirm(
      `Cancelar sua inscrição em "${eventTitle}"?`
    );

    if (!confirmed || !user) return;

    try {
      await unsubscribeEvent(eventId);
      setRegisteredEvents(registeredEvents.filter(e => e.id !== eventId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao cancelar inscrição");
    }
  };

  return (
    <RequireAuth>
      <main className="flex min-h-screen flex-col bg-[#fbfbf7] text-[#1e261e]">
        <FeedHeader showSearch={false} />

        <div className="mx-auto w-full max-w-[1220px] flex-1 px-4 pb-14 pt-10 sm:px-7 lg:pt-12">
          <section aria-labelledby="appointments-title">
            <div className="max-w-[650px]">
              <h1
                id="appointments-title"
                className="text-[34px] font-black leading-tight tracking-[-0.04em] text-[#1f6f2a] sm:text-[44px]"
              >
                Meus Agendamentos
              </h1>
              <p className="mt-3 max-w-[610px] text-[13px] font-medium leading-6 text-[#556050]">
                Acompanhe suas atividades agendadas no campus da UFRPE.
                Organize sua jornada sustentável com facilidade.
              </p>
            </div>

            {loading && (
              <div className="mt-10 text-center text-gray-600">
                Carregando seus agendamentos...
              </div>
            )}

            {error && (
              <div className="mt-10 rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {!loading && registeredEvents.length > 0 ? (
              <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {registeredEvents.map((event) => (
                  <AppointmentCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    date={formatDate(event.start_date)}
                    location={event.location_name}
                    href={`/agendamentos/${event.id}`}
                    onCancel={() => handleCancel(event.id, event.title)}
                  />
                ))}
              </div>
            ) : !loading ? (
              <EmptyAppointmentsState />
            ) : null}

            {!loading && registeredEvents.length > 0 ? (
              <div className="mt-11 flex justify-center">
                <NewAppointmentCard />
              </div>
            ) : null}

          </section>
        </div>

        <AppointmentsFooter />
      </main>
    </RequireAuth>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

function EmptyAppointmentsState() {
  return (
    <section className="mt-10 flex min-h-[230px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#d8dbd2] bg-[#fbfbf7] px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4f5df] text-[#287630]">
        <CalendarIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-6 text-[20px] font-black tracking-[-0.03em] text-[#1e261e]">
        Nenhum agendamento confirmado
      </h2>
      <p className="mt-3 max-w-[360px] text-[12px] font-semibold leading-5 text-[#777f72]">
        Inscreva-se em um evento em Explorar Eventos para que ele
        apareça aqui.
      </p>
      <Link
        href="/agendamentos/explorar"
        className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#287630] px-8 text-center text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.22)] transition hover:bg-[#1f6428]"
      >
        Explorar Eventos
      </Link>
    </section>
  );
}

function AppointmentCard({
  id,
  title,
  date,
  location,
  href,
  onCancel,
}: {
  id: string;
  title: string;
  date: string;
  location: string;
  href: string;
  onCancel: () => void;
}) {
  return (
    <article className="flex min-h-[264px] flex-col rounded-[26px] bg-white px-7 py-7 shadow-[0_20px_45px_rgba(33,55,30,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-[#c9f7ca] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#287630]">
          Confirmado
        </span>
        <CalendarIcon className="mt-1 h-[17px] w-[17px] text-[#aab2a5]" />
      </div>

      <p className="mt-7 text-[10px] font-black uppercase tracking-[0.08em] text-[#287630]">
        {date}
      </p>
      <h2 className="mt-3 max-w-[270px] text-[21px] font-black leading-[1.12] tracking-[-0.03em] text-[#1e261e]">
        {title}
      </h2>

      <p className="mt-7 flex items-center gap-2 text-[11px] font-semibold text-[#65705f]">
        <LocationIcon className="h-[13px] w-[13px] shrink-0 text-[#343c32]" />
        <span>{location}</span>
      </p>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#edf0e9] pt-6">
        <Link
          href={href}
          className="text-[11px] font-black text-[#287630] transition hover:text-[#1f6428]"
        >
          Ver Detalhes
        </Link>
        <Link
          href={href}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#c5cbbf] transition hover:bg-[#f2f5ef] hover:text-[#287630]"
          aria-label={`Ver detalhes de ${title}`}
        >
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-4 h-10 rounded-full border border-[#f1c4c4] bg-white px-5 text-[11px] font-black text-[#b92828] transition hover:bg-[#fff3f3]"
      >
        Cancelar inscrição
      </button>
    </article>
  );
}

function NewAppointmentCard() {
  return (
    <aside className="flex min-h-[264px] w-full max-w-[372px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#d8dbd2] bg-[#fbfbf7] px-8 text-center">
      <h2 className="text-[18px] font-black tracking-[-0.03em] text-[#1e261e]">
        Novo Agendamento
      </h2>
      <p className="mt-3 max-w-[245px] text-[11px] font-semibold leading-5 text-[#777f72]">
        Encontre novas atividades e participe da nossa comunidade.
      </p>

      <Link
        href="/agendamentos/explorar"
        className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#287630] px-8 text-center text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.22)] transition hover:bg-[#1f6428]"
      >
        Explorar Eventos
      </Link>
    </aside>
  );
}

function AppointmentsFooter() {
  return (
    <footer className="border-t border-[#eceee8] bg-[#fbfbf7]">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-4 px-4 py-8 text-[11px] font-semibold text-[#8a9186] sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="font-black text-[#1e261e]">SustentaRural</p>
        <nav className="flex flex-wrap gap-7">
          <a href="#" className="transition hover:text-[#287630]">
            Sobre
          </a>
          <a href="#" className="transition hover:text-[#287630]">
            Termos
          </a>
          <a href="#" className="transition hover:text-[#287630]">
            Privacidade
          </a>
        </nav>
        <p>© 2026 SustentaRural - UFRPE</p>
      </div>
    </footer>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function LocationIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}
