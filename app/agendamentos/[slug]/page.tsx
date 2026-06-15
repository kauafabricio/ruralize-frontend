"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { RegistrationActions } from "@/app/components/appointments/RegistrationActions";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { useAuthenticatedUser } from "@/app/components/auth/useAuthenticatedUser";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import {
  getEvent,
  deleteEvent,
  updateEvent,
  type EventResponse,
  type EventUpdate,
} from "@/app/services/api/events.api";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const eventId = typeof params?.slug === "string" ? params.slug : "";

  const router = useRouter();
  const user = useAuthenticatedUser();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location_name: "",
    address: "",
    max_participants: "",
    points: "",
    photo_url: "",
    status: "",
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManageEvent = Boolean(
    user?.userId && event?.promoter_id && user.userId === event.promoter_id,
  );

  const formatToDateTimeLocal = (dateString: string) => {
    if (!dateString) {
      return "";
    }

    // When backend returns a timezone-aware value, adjust to local time.
    if (/[zZ]|[+-]\d{2}:\d{2}$/.test(dateString)) {
      try {
        const date = new Date(dateString);
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      } catch {
        return dateString.slice(0, 16);
      }
    }

    // Backend may return naive local date-time strings already suitable for datetime-local.
    return dateString.slice(0, 16);
  };

  const fetchEvent = async () => {
    if (!eventId) {
      setError("Evento inválido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getEvent(eventId);
      setEvent(data);
      setEditForm({
        title: data.title,
        description: data.description,
        start_date: formatToDateTimeLocal(data.start_date),
        end_date: formatToDateTimeLocal(data.end_date),
        location_name: data.location_name,
        address: data.address,
        max_participants: String(data.max_participants),
        points: String(data.points),
        photo_url: data.photo_url ?? "",
        status: data.status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar evento");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveChanges = async (eventSubmit: React.FormEvent<HTMLFormElement>) => {
    eventSubmit.preventDefault();

    if (!event) {
      return;
    }

    setIsSaving(true);
    setActionError(null);
    setActionMessage(null);

    const updatePayload: EventUpdate = {
      title: editForm.title,
      description: editForm.description,
      start_date: editForm.start_date,
      end_date: editForm.end_date,
      location_name: editForm.location_name,
      address: editForm.address,
      max_participants: Number(editForm.max_participants),
      points: Number(editForm.points),
      photo_url: editForm.photo_url || undefined,
      status: editForm.status || undefined,
    };

    try {
      await updateEvent(event.id, updatePayload);
      setActionMessage("Evento atualizado com sucesso.");
      setEditMode(false);
      await fetchEvent();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erro ao atualizar evento");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) {
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.",
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await deleteEvent(event.id);
      router.push("/agendamentos");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erro ao excluir evento");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <RequireAuth>
        <main className="min-h-screen bg-[#fbfbf7] text-neutral-darker">
          <FeedHeader showSearch={false} />
          <div className="mx-auto w-full max-w-[1220px] px-4 pb-16 pt-10 sm:px-7">
            <div className="animate-pulse space-y-4">
              <div className="h-[53px] rounded bg-[#e0e5d8] w-2/3" />
              <div className="h-4 rounded bg-[#e0e5d8] w-full" />
              <div className="h-[360px] rounded bg-[#e0e5d8]" />
            </div>
          </div>
        </main>
      </RequireAuth>
    );
  }

  if (error || !event) {
    return (
      <RequireAuth>
        <main className="min-h-screen bg-[#fbfbf7] text-neutral-darker">
          <FeedHeader showSearch={false} />
          <div className="mx-auto w-full max-w-[1220px] px-4 pb-16 pt-10 sm:px-7">
            <div className="rounded-[10px] bg-red-50 p-4 text-red-700">
              {error || "Evento não encontrado"}
            </div>
            <button
              onClick={() => router.back()}
              className="mt-4 rounded-full bg-primary-dark px-6 py-2 text-white font-black"
            >
              Voltar
            </button>
          </div>
        </main>
      </RequireAuth>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#fbfbf7] text-neutral-darker">
        <FeedHeader showSearch={false} />

        <div className="mx-auto grid w-full max-w-[1220px] gap-10 px-4 pb-16 pt-10 sm:px-7 lg:grid-cols-[minmax(0,650px)_460px] lg:gap-14 lg:pt-12">
          <section aria-labelledby="event-title">
            <h1
              id="event-title"
              className="max-w-[560px] text-[39px] font-black leading-[1.04] tracking-[-0.05em] text-primary-dark sm:text-[53px]"
            >
              {event.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-3">
              {event.action_name && (
                <span className="rounded-full bg-[#c9f7ca] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-primary-dark">
                  {event.action_name}
                </span>
              )}
              <span className="rounded-full bg-[#e5e6e1] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#596255]">
                {event.status}
              </span>
            </div>

            <p className="mt-12 max-w-[620px] text-[14px] font-medium leading-7 text-[#465142]">
              {event.description}
            </p>

            <dl className="mt-12 space-y-8">
              <DetailItem
                icon={<LocationIcon className="h-[17px] w-[17px]" />}
                label="Local"
                title={event.location_name}
                description={event.address}
              />
              <DetailItem
                icon={<ClockIcon className="h-[17px] w-[17px]" />}
                label="Horário"
                title={`${formatDate(event.start_date)} às ${formatTime(event.start_date)}`}
                description={`Encerra às ${formatTime(event.end_date)}`}
              />
              <DetailItem
                icon={<PersonIcon className="h-[17px] w-[17px]" />}
                label="Responsável"
                title={event.promoter_name || "—"}
                description={event.status}
                avatar
              />
            </dl>
          </section>

          <aside className="lg:pt-1">
            <div
              className="h-[260px] rounded-[8px] bg-[#dce9d3] bg-cover bg-center shadow-[0_18px_40px_rgba(33,55,30,0.12)] sm:h-[360px]"
              role="img"
              aria-label={event.title}
              style={{
                backgroundImage: event.photo_url
                  ? `url("${event.photo_url}")`
                  : "linear-gradient(135deg, #c9f7ca 0%, #dfe8d8 100%)",
              }}
            />

            <section className="mt-8 rounded-[10px] border border-[#e6e8e0] bg-white px-8 py-8 shadow-[0_10px_28px_rgba(33,55,30,0.05)]">
              <h2 className="text-[18px] font-black tracking-[-0.03em] text-neutral-darker">
                Garanta sua vaga
              </h2>
              <p className="mt-4 text-[12px] font-medium leading-5 text-[#566052]">
                Vagas disponíveis: {Math.max(0, event.max_participants - (event.participant_count || 0))} de {event.max_participants}
              </p>

              <RegistrationActions
                eventId={eventId}
                formHref={`/agendamentos/${eventId}/formulario`}
                promoterId={event.promoter_id}
                startDate={event.start_date}
                endDate={event.end_date}
              />

              {canManageEvent ? (
                <div className="mt-6 rounded-xl border border-[#d4e8d4] bg-[#f4fbf3] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.08em] text-primary-dark">
                    Gerenciar evento
                  </p>

                  {actionError ? (
                    <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
                      {actionError}
                    </div>
                  ) : null}

                  {actionMessage ? (
                    <div className="mt-3 rounded bg-green-50 p-3 text-sm text-green-700">
                      {actionMessage}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setEditMode((current) => !current)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#287630] bg-white px-4 text-[12px] font-black text-primary-dark transition hover:bg-[#f4fbf3]"
                    >
                      {editMode ? "Cancelar edição" : "Editar evento"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteEvent}
                      disabled={isDeleting}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#b92828] px-4 text-[12px] font-black text-white transition hover:bg-[#991d1d] disabled:opacity-60"
                    >
                      {isDeleting ? "Excluindo..." : "Excluir evento"}
                    </button>
                  </div>

                  {editMode ? (
                    <form className="mt-5 space-y-4" onSubmit={handleSaveChanges}>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#44503f]">
                          Título
                        </label>
                        <input
                          value={editForm.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          className="mt-2 w-full rounded-[10px] border border-[#c9d4c1] bg-white px-3 py-2 text-sm text-neutral-darker"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold text-[#44503f]">
                          Descrição
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          className="mt-2 w-full rounded-[10px] border border-[#c9d4c1] bg-white px-3 py-2 text-sm text-neutral-darker"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-[12px] font-semibold text-[#44503f]">
                          Início
                          <input
                            type="datetime-local"
                            value={editForm.start_date}
                            onChange={(e) => handleInputChange("start_date", e.target.value)}
                            className="mt-2 w-full rounded-[10px] border border-[#c9d4c1] bg-white px-3 py-2 text-sm text-neutral-darker"
                          />
                        </label>
                        <label className="block text-[12px] font-semibold text-[#44503f]">
                          Término
                          <input
                            type="datetime-local"
                            value={editForm.end_date}
                            onChange={(e) => handleInputChange("end_date", e.target.value)}
                            className="mt-2 w-full rounded-[10px] border border-[#c9d4c1] bg-white px-3 py-2 text-sm text-neutral-darker"
                          />
                        </label>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-[12px] font-semibold text-[#44503f]">
                          Local
                          <input
                            value={editForm.location_name}
                            onChange={(e) => handleInputChange("location_name", e.target.value)}
                            className="mt-2 w-full rounded-[10px] border border-[#c9d4c1] bg-white px-3 py-2 text-sm text-neutral-darker"
                          />
                        </label>
                        <label className="block text-[12px] font-semibold text-[#44503f]">
                          Endereço
                          <input
                            value={editForm.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            className="mt-2 w-full rounded-[10px] border border-[#c9d4c1] bg-white px-3 py-2 text-sm text-neutral-darker"
                          />
                        </label>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-[12px] font-semibold text-[#44503f]">
                          Máx. participantes
                          <input
                            type="number"
                            min="1"
                            value={editForm.max_participants}
                            onChange={(e) => handleInputChange("max_participants", e.target.value)}
                            className="mt-2 w-full rounded-[10px] border border-[#c9d4c1] bg-white px-3 py-2 text-sm text-neutral-darker"
                          />
                        </label>
                        <label className="block text-[12px] font-semibold text-[#44503f]">
                          Pontos
                          <input
                            type="number"
                            min="1"
                            value={editForm.points}
                            onChange={(e) => handleInputChange("points", e.target.value)}
                            className="mt-2 w-full rounded-[10px] border border-[#c9d4c1] bg-white px-3 py-2 text-sm text-neutral-darker"
                          />
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="mt-2 inline-flex w-full h-12 items-center justify-center rounded-full bg-primary-dark px-4 text-[12px] font-black text-white transition hover:bg-primary-darker disabled:opacity-60"
                      >
                        {isSaving ? "Salvando..." : "Salvar alterações"}
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}

              <p className="mt-6 flex items-center justify-center gap-2 text-[10px] font-semibold text-[#a0a69b]">
                <ShieldIcon className="h-3.5 w-3.5" />
                Sua inscrição será validada pela equipe.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </RequireAuth>
  );
}

function DetailItem({
  icon,
  label,
  title,
  description,
  avatar = false,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  avatar?: boolean;
}) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-5">
      <dt className="flex h-9 w-9 items-center justify-center rounded-full bg-success-light text-primary-dark">
        {icon}
      </dt>
      <dd>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary-dark">
          {label}
        </p>
        <div className="mt-2 flex items-center gap-3">
          {avatar ? (
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-dark ring-2 ring-neutral-lighter">
              <span className="absolute inset-x-[9px] top-[7px] h-[10px] rounded-full bg-[#f0b07b]" />
              <span className="absolute left-[11px] top-[14px] h-[8px] w-[18px] rounded-t-full bg-[#273f2a]" />
              <span className="absolute bottom-0 left-[7px] h-[19px] w-[26px] rounded-t-[16px] bg-[#e2ead8]" />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-[13px] font-black leading-5 text-neutral-darker">
              {title}
            </p>
            <p className="text-[11px] font-semibold leading-5 text-neutral-muted">
              {description}
            </p>
          </div>
        </div>
      </dd>
    </div>
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

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PersonIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12.5l2 2 3.5-3.5" />
    </svg>
  );
}

