"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { useAuthenticatedUser } from "@/app/components/auth/useAuthenticatedUser";
import { listEvents, createEvent, EventListResponse, EventCreate } from "@/app/services/api/events.api";
import { useTeacherAccess } from "@/app/lib/useTeacherAccess";

export default function ExplorarEventosPage() {
  const user = useAuthenticatedUser();
  const { isTeacher, loadingProfile } = useTeacherAccess();
  const [events, setEvents] = useState<EventListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listEvents();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar eventos");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !isTeacher) {
      setCreateError("Apenas professores podem criar eventos");
      return;
    }

    setCreatingEvent(true);
    setCreateError(null);
    const form = e.currentTarget;

    try {
      const formData = new FormData(form);
      const file = formData.get("photo_file") as File | null;
      const photoUrl = file?.name ? await readFileAsDataUrl(file) : undefined;

      const eventData: EventCreate = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        action_id: formData.get("action_id") as string,
        start_date: formData.get("start_date") as string,
        end_date: formData.get("end_date") as string,
        location_name: formData.get("location_name") as string,
        address: formData.get("address") as string,
        max_participants: parseInt(formData.get("max_participants") as string),
        points: parseInt(formData.get("points") as string),
        photo_url: photoUrl,
      };

      await createEvent(eventData);

      const updatedEvents = await listEvents();
      setEvents(updatedEvents);

      form.reset();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar evento");
    } finally {
      setCreatingEvent(false);
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Falha ao ler o arquivo de imagem"));
        }
      };
      reader.onerror = () => reject(new Error("Falha ao ler o arquivo de imagem"));
      reader.readAsDataURL(file);
    });

  return (
    <RequireAuth>
      <main className="flex min-h-screen flex-col bg-[#fbfbf7] text-[#1e261e]">
        <FeedHeader showSearch={false} />

        <div className="mx-auto w-full max-w-[1220px] flex-1 px-4 pb-16 pt-10 sm:px-7 lg:pt-11">
          {/* Teacher Create Event Section */}
          {isTeacher && !loadingProfile && (
            <section className="mb-14 rounded-2xl bg-white p-8 shadow-md">
              <h2 className="text-2xl font-bold text-[#1f6f2a]">Criar Novo Evento</h2>
              <p className="mt-2 text-sm text-gray-600">
                Crie eventos sustentáveis para engajar sua comunidade
              </p>

              {createError && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateEvent} className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  name="title"
                  placeholder="Título do evento"
                  required
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="text"
                  name="location_name"
                  placeholder="Local (nome)"
                  required
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Endereço"
                  required
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="text"
                  name="action_id"
                  placeholder="Action ID"
                  required
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="datetime-local"
                  name="start_date"
                  required
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="datetime-local"
                  name="end_date"
                  required
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="number"
                  name="max_participants"
                  placeholder="Máx. participantes"
                  required
                  min="1"
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="number"
                  name="points"
                  placeholder="Pontos"
                  required
                  min="1"
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <textarea
                  name="description"
                  placeholder="Descrição do evento"
                  required
                  className="col-span-2 rounded-lg border border-gray-300 px-4 py-2"
                  rows={3}
                />
                <label className="col-span-2 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#434845]">
                  <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#5e6a55]">
                    Imagem do evento (opcional)
                  </span>
                  <input
                    type="file"
                    name="photo_file"
                    accept="image/*"
                    className="mt-3 w-full text-sm text-[#2e372f]"
                  />
                </label>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="col-span-2 rounded-lg bg-[#287630] px-6 py-2 font-bold text-white transition hover:bg-[#1f6428] disabled:opacity-50"
                >
                  {creatingEvent ? "Criando..." : "Criar Evento"}
                </button>
              </form>
            </section>
          )}

          {/* Events Listing Section */}
          <section aria-labelledby="events-title">
            <div className="max-w-[810px]">
              <h1
                id="events-title"
                className="text-[31px] font-medium leading-tight tracking-[-0.04em] text-[#2f392f] sm:text-[40px]"
              >
                Cultive o futuro da nossa{" "}
                <span className="font-black text-[#1f6f2a]">Universidade</span>
              </h1>
              <p className="mt-4 max-w-[560px] text-[13px] font-medium leading-6 text-[#505a4c]">
                Explore iniciativas e eventos sustentaveis na UFRPE. Sua
                participacao gera impacto real e pontos de engajamento.
              </p>
            </div>

            {loadingProfile ? (
              <p className="mt-8 text-[12px] font-semibold text-[#687266]">
                Verificando permissoes de docente...
              </p>
            ) : null}

            {error && (
              <div className="mt-10 rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {!loading && events.length === 0 && (
              <div className="mt-10 text-center text-gray-600">
                Nenhum evento disponível no momento.
              </div>
            )}

            {!loading && events.length > 0 && (
              <div className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={event.start_date}
                    image={event.photo_url}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <EventsFooter />
      </main>
    </RequireAuth>
  );
}

function EventCard({
  id,
  title,
  description,
  date,
  image,
}: {
  id: string;
  title: string;
  description: string;
  date: string;
  image?: string | null;
}) {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  return (
    <article className="overflow-hidden rounded-[18px] bg-white shadow-[0_18px_42px_rgba(33,55,30,0.08)]">
      <div className="relative h-[176px] bg-[#dfe8d8]">
        <div
          className="h-full w-full bg-cover bg-center"
          role="img"
          aria-label={title}
          style={{
            backgroundImage: image
              ? `url("${image}")`
              : "linear-gradient(135deg, #c9f7ca 0%, #dfe8d8 100%)",
          }}
        />
      </div>

      <div className="px-6 pb-7 pt-5">
        <p className="flex items-center gap-1.5 text-[10px] font-black text-[#287630]">
          <CalendarIcon className="h-[12px] w-[12px]" />
          {formatDate(date)}
        </p>

        <h2 className="mt-3 text-[19px] font-black leading-6 tracking-[-0.03em] text-[#1e261e]">
          {title}
        </h2>
        <p className="mt-3 min-h-[72px] text-[12px] font-medium leading-5 text-[#556050]">
          {description}
        </p>

        <Link
          href={`/agendamentos/${id}`}
          className="mt-6 flex h-11 items-center justify-center rounded-full bg-[#287630] px-6 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)] transition hover:bg-[#1f6428]"
        >
          Quero Participar
        </Link>
      </div>
    </article>
  );
}


function EventsFooter() {
  return (
    <footer className="border-t border-[#eceee8] bg-[#fbfbf7]">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-4 px-4 py-8 text-[11px] font-semibold text-[#8a9186] sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p>
          <span className="font-black text-[#1e261e]">SustentaRural</span>
          <br />
          <span className="text-[10px]">2026 SustentaRural - UFRPE</span>
        </p>
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
