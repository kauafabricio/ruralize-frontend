"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { useAuthenticatedUser } from "@/app/components/auth/useAuthenticatedUser";
import { getMySubscriptions, SubscriptionResponse } from "@/app/services/api/subscriptions.api";
import { unsubscribeEvent } from "@/app/services/api/events.api";

export default function AgendamentosPage() {
  const user = useAuthenticatedUser();
  const [registeredEvents, setRegisteredEvents] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's events from backend
  useEffect(() => {
    if (!user) return;

    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMySubscriptions();
        setRegisteredEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar agendamentos");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  const handleCancel = async (eventId: string, eventTitle: string) => {
    const confirmed = window.confirm(
      `Cancelar sua inscrição em "${eventTitle}"?`
    );

    if (!confirmed || !user) return;

    try {
      await unsubscribeEvent(eventId);
      setRegisteredEvents((current) => current.filter((e) => e.event.id !== eventId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao cancelar inscrição");
    }
  };

  // Separate events into upcoming and past
  const now = new Date();

  const agendadosEvents = registeredEvents.filter(
    ({ event }) => new Date(event.start_date) > now
  );
  const realizadosEvents = registeredEvents.filter(
    ({ event }) => new Date(event.start_date) <= now
  );

  return (
    <RequireAuth>
      <main className="flex min-h-screen flex-col bg-[#fbfbf7] text-neutral-darker">
        <FeedHeader showSearch={false} />

        <div className="mx-auto w-full max-w-[1220px] flex-1 px-4 pb-14 pt-10 sm:px-7 lg:pt-12">
          <section aria-labelledby="appointments-title">
            <div className="max-w-[650px]">
              <h1
                id="appointments-title"
                className="text-[34px] font-black leading-tight tracking-[-0.04em] text-primary-dark sm:text-[44px]"
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

            {!loading && (
              <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_372px]">
                {/* Main content - Events */}
                <div>
                  {registeredEvents.length > 0 ? (
                    <>
                      {/* Próximos Eventos */}
                      <div>
                        <h2 className="text-[24px] font-black tracking-[-0.03em] text-neutral-darker flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-light text-primary-dark">
                            📅
                          </span>
                          Próximos Eventos
                        </h2>

                        {agendadosEvents.length > 0 ? (
                          <div className="mt-6 grid gap-7 md:grid-cols-2">
                            {agendadosEvents.map((subscription) => (
                              <AppointmentCard
                                key={subscription.id}
                                id={subscription.event.id}
                                title={subscription.event.title}
                                date={formatDate(subscription.event.start_date)}
                                location={subscription.event.location_name}
                                href={`/agendamentos/${subscription.event.id}`}
                                onCancel={() => handleCancel(subscription.event.id, subscription.event.title)}
                                status="Confirmado"
                                showCancel={true}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="mt-6 flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d8dbd2] bg-[#fbfbf7]">
                            <p className="text-[14px] font-semibold text-[#777f72]">
                              Nenhum evento agendado no momento
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Eventos Realizados */}
                      {realizadosEvents.length > 0 && (
                        <div className="mt-14">
                          <h2 className="text-[24px] font-black tracking-[-0.03em] text-neutral-darker flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-lighter text-[#556050]">
                              ✅
                            </span>
                            Eventos Realizados
                          </h2>

                          <div className="mt-6 grid gap-7 md:grid-cols-2">
                            {realizadosEvents.map((subscription) => (
                              <AppointmentCard
                                key={subscription.id}
                                id={subscription.event.id}
                                title={subscription.event.title}
                                date={formatDate(subscription.event.start_date)}
                                location={subscription.event.location_name}
                                href={`/agendamentos/${subscription.event.id}`}
                                onCancel={() => handleCancel(subscription.event.id, subscription.event.title)}
                                status="Realizado"
                                showCancel={false}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d8dbd2] bg-[#fbfbf7]">
                      <p className="text-[14px] font-semibold text-[#777f72]">
                        Nenhum agendamento confirmado
                      </p>
                    </div>
                  )}
                </div>

                {/* Sidebar - Explorar Eventos Card */}
                <aside className="sticky top-20 h-fit">
                  <NewAppointmentCard />
                </aside>
              </div>
            )}
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

function AppointmentCard({
  id,
  title,
  date,
  location,
  href,
  onCancel,
  status,
  showCancel,
}: {
  id: string;
  title: string;
  date: string;
  location: string;
  href: string;
  onCancel: () => void;
  status: "Confirmado" | "Realizado";
  showCancel: boolean;
}) {
  const isRealized = status === "Realizado";
  return (
    <article className={`flex min-h-[264px] flex-col rounded-[26px] px-7 py-7 shadow-[0_20px_45px_rgba(33,55,30,0.08)] ${isRealized ? "border border-[#d8dbd2] bg-[#f7f7f3]" : "bg-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] ${isRealized ? "bg-neutral-lighter text-[#556050]" : "bg-[#c9f7ca] text-primary-dark"}`}>
          {status}
        </span>
        <CalendarIcon className="mt-1 h-[17px] w-[17px] text-[#aab2a5]" />
      </div>

      <p className={`mt-7 text-[10px] font-black uppercase tracking-[0.08em] ${isRealized ? "text-[#a0a69b]" : "text-primary-dark"}`}>
        {date}
      </p>
      <h2 className="mt-3 max-w-[270px] text-[21px] font-black leading-[1.12] tracking-[-0.03em] text-neutral-darker">
        {title}
      </h2>

      <p className="mt-7 flex items-center gap-2 text-[11px] font-semibold text-neutral-muted">
        <LocationIcon className="h-[13px] w-[13px] shrink-0 text-[#343c32]" />
        <span>{location}</span>
      </p>

      <div className={`mt-auto border-t pt-6 ${isRealized ? "border-[#e0e4db]" : "border-[#edf0e9]"}`}>
        <Link
          href={href}
          className={`text-[11px] font-black transition ${isRealized ? "text-[#a0a69b] hover:text-[#778372]" : "text-primary-dark hover:text-primary-darker"}`}
        >
          Ver Detalhes
        </Link>
        <Link
          href={href}
          className={`ml-auto flex h-8 w-8 items-center justify-center rounded-full transition ${isRealized ? "text-[#d4d9d0] hover:bg-[#efefef] hover:text-[#a0a69b]" : "text-[#c5cbbf] hover:bg-[#f2f5ef] hover:text-primary-dark"}`}
          aria-label={`Ver detalhes de ${title}`}
        >
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>

      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 h-10 rounded-full border border-[#f1c4c4] bg-white px-5 text-[11px] font-black text-danger-primary transition hover:bg-danger-light"
        >
          Cancelar inscrição
        </button>
      )}
    </article>
  );
}

function NewAppointmentCard() {
  return (
    <aside className="flex min-h-[264px] w-full flex-col items-center justify-center rounded-[26px] border border-dashed border-[#d8dbd2] bg-[#fbfbf7] px-8 text-center">
      <h2 className="text-[18px] font-black tracking-[-0.03em] text-neutral-darker">
        Explorar Eventos
      </h2>
      <p className="mt-3 max-w-[245px] text-[11px] font-semibold leading-5 text-[#777f72]">
        Encontre novas atividades e participe da nossa comunidade.
      </p>

      <Link
        href="/agendamentos/explorar"
        className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-primary-dark px-8 text-center text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.22)] transition hover:bg-primary-darker"
      >
        Explorar Eventos
      </Link>
    </aside>
  );
}

function AppointmentsFooter() {
  return (
    <footer className="border-t border-[#eceee8] bg-[#fbfbf7]">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-4 px-4 py-8 text-[11px] font-semibold text-neutral-muted sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="font-black text-neutral-darker">SustentaRural</p>
        <nav className="flex flex-wrap gap-7">
          <a href="#" className="transition hover:text-primary-dark">
            Sobre
          </a>
          <a href="#" className="transition hover:text-primary-dark">
            Termos
          </a>
          <a href="#" className="transition hover:text-primary-dark">
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
