"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { events, type Appointment } from "@/app/lib/appointments";
import {
  readRegisteredEventSlugs,
  unregisterEvent,
} from "@/app/lib/eventRegistration";
import {
  eventToAppointment,
  eventToInput,
  eventToUserCreatedEvent,
  updateEventPayload,
  type UserCreatedEvent,
  type UserEventInput,
} from "@/app/lib/userEvents";
import { useTeacherAccess } from "@/app/lib/useTeacherAccess";
import {
  getEvent,
  getEventParticipants,
  getMyEvents,
  listEvents,
  unsubscribeEvent,
  updateEvent,
  type EventParticipant,
} from "@/app/services/api/events.api";

export default function AgendamentosPage() {
  const { user, isTeacher } = useTeacherAccess();
  const [registeredEventSlugs, setRegisteredEventSlugs] = useState<string[]>(
    [],
  );
  const [backendRegisteredEvents, setBackendRegisteredEvents] = useState<
    Appointment[]
  >([]);
  const [createdEvents, setCreatedEvents] = useState<UserCreatedEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<UserCreatedEvent | null>(
    null,
  );
  const [selectedRegistrations, setSelectedRegistrations] = useState<{
    event: UserCreatedEvent;
    registrations: EventParticipant[];
  } | null>(null);
  const fixedRegisteredEvents = events.filter((event) =>
    registeredEventSlugs.includes(event.slug),
  );
  const registeredEvents = [...backendRegisteredEvents, ...fixedRegisteredEvents];
  const canManageEvents = isTeacher;

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    setRegisteredEventSlugs(readRegisteredEventSlugs());
    refreshBackendEvents();
  }, [canManageEvents, user?.id]);

  async function refreshBackendEvents() {
    if (!user?.id) {
      return;
    }

    const myEvents = await getMyEvents(user.id).catch(() => []);
    setBackendRegisteredEvents(myEvents.map(eventToAppointment));

    if (!canManageEvents) {
      setCreatedEvents([]);
      return;
    }

    const listedEvents = await listEvents().catch(() => []);
    const detailedEvents = await Promise.all(
      listedEvents.map((event) => getEvent(event.id).catch(() => null)),
    );
    setCreatedEvents(
      detailedEvents
        .filter(
          (event): event is NonNullable<typeof event> =>
            Boolean(event && event.promoter_id === user.id),
        )
        .map(eventToUserCreatedEvent),
    );
  }

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

            {registeredEvents.length > 0 ? (
              <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {registeredEvents.map((appointment) => (
                  <AppointmentCard
                    key={appointment.title}
                    status="Confirmado"
                    date={appointment.date}
                    title={appointment.title}
                    location={appointment.location}
                    href={`/agendamentos/${appointment.slug}`}
                    onCancel={async () => {
                      if (
                        backendRegisteredEvents.some(
                          (event) => event.slug === appointment.slug,
                        ) &&
                        user?.id
                      ) {
                        await unsubscribeEvent(appointment.slug, user.id);
                        await refreshBackendEvents();
                        return;
                      }

                      const nextRegisteredEvents = unregisterEvent(
                        appointment.slug,
                      );
                      setRegisteredEventSlugs(nextRegisteredEvents);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyAppointmentsState />
            )}

            {registeredEvents.length > 0 ? (
              <div className="mt-11 flex justify-center">
                <NewAppointmentCard />
              </div>
            ) : null}

            {canManageEvents && createdEvents.length > 0 ? (
              <section className="mt-14 border-t border-[#edf0e9] pt-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#287630]">
                      Area docente
                    </p>
                    <h2 className="mt-2 text-[26px] font-black tracking-[-0.04em] text-[#1f6f2a]">
                      Eventos criados por voce
                    </h2>
                  </div>
                  <Link
                    href="/agendamentos/explorar"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-[#287630] px-6 text-[11px] font-black text-white"
                  >
                    Criar novo evento
                  </Link>
                </div>
                <div className="mt-7 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                  {createdEvents.map((event) => (
                    <CreatedEventCard
                      key={event.slug}
                      event={event}
                      onEdit={() => setEditingEvent(event)}
                      onViewRegistrations={() =>
                        getEventParticipants(event.id).then((registrations) =>
                          setSelectedRegistrations({
                            event,
                            registrations,
                          }),
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        </div>

        <AppointmentsFooter />
        {editingEvent ? (
          <EditCreatedEventDialog
            event={editingEvent}
            onCancel={() => setEditingEvent(null)}
            onSave={(input) => {
              if (user?.id) {
                updateEvent(
                  editingEvent.id,
                  user.id,
                  updateEventPayload(input),
                ).then(() => {
                  refreshBackendEvents();
                  setEditingEvent(null);
                });
              }
            }}
          />
        ) : null}
        {selectedRegistrations ? (
          <RegistrationsDialog
            title={selectedRegistrations.event.title}
            registrations={selectedRegistrations.registrations}
            onClose={() => setSelectedRegistrations(null)}
          />
        ) : null}
      </main>
    </RequireAuth>
  );
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
        Preencha o formulário de um evento em Explorar Eventos para que ele
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
  status,
  date,
  title,
  location,
  href,
  onCancel,
}: {
  status: string;
  date: string;
  title: string;
  location: string;
  href: string;
  onCancel: () => void;
}) {
  return (
    <article className="flex min-h-[264px] flex-col rounded-[26px] bg-white px-7 py-7 shadow-[0_20px_45px_rgba(33,55,30,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-[#c9f7ca] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#287630]">
          {status}
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
        onClick={() => {
          const confirmed = window.confirm(
            `Cancelar sua inscricao em "${title}"?`,
          );

          if (confirmed) {
            onCancel();
          }
        }}
        className="mt-4 h-10 rounded-full border border-[#f1c4c4] bg-white px-5 text-[11px] font-black text-[#b92828] transition hover:bg-[#fff3f3]"
      >
        Cancelar inscricao
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

function CreatedEventCard({
  event,
  onEdit,
  onViewRegistrations,
}: {
  event: UserCreatedEvent;
  onEdit: () => void;
  onViewRegistrations: () => void;
}) {
  return (
    <article className="flex min-h-[264px] flex-col rounded-[26px] bg-white px-7 py-7 shadow-[0_20px_45px_rgba(33,55,30,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-[#e4f5df] px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#287630]">
          Criado por voce
        </span>
        <CalendarIcon className="mt-1 h-[17px] w-[17px] text-[#aab2a5]" />
      </div>
      <p className="mt-7 text-[10px] font-black uppercase tracking-[0.08em] text-[#287630]">
        {event.compactDate}
      </p>
      <h3 className="mt-3 max-w-[270px] text-[21px] font-black leading-[1.12] tracking-[-0.03em] text-[#1e261e]">
        {event.title}
      </h3>
      <p className="mt-5 text-[12px] font-semibold leading-5 text-[#65705f]">
        {event.shortDescription}
      </p>
      <div className="mt-auto grid gap-3 border-t border-[#edf0e9] pt-6 sm:grid-cols-2">
        <button
          type="button"
          onClick={onEdit}
          className="h-10 rounded-full bg-[#eef0ea] px-5 text-[11px] font-black text-[#4f5b4e] transition hover:bg-[#e3e7dd]"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onViewRegistrations}
          className="h-10 rounded-full bg-[#287630] px-5 text-[11px] font-black text-white transition hover:bg-[#1f6428]"
        >
          Inscricoes
        </button>
      </div>
    </article>
  );
}

function EditCreatedEventDialog({
  event,
  onCancel,
  onSave,
}: {
  event: UserCreatedEvent;
  onCancel: () => void;
  onSave: (input: UserEventInput) => void;
}) {
  const [form, setForm] = useState<UserEventInput>({
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    address: event.address,
    category: event.category,
    shortDescription: event.shortDescription,
    summary: event.summary,
    image: event.image,
    tags: event.tags.join(", "),
    maxParticipants: String(event.maxParticipants ?? 30),
    points: String(event.points ?? 10),
  });

  function updateField(field: keyof UserEventInput, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1f281f]/35 px-4 py-8 backdrop-blur-[4px]">
      <form
        onSubmit={(eventSubmit) => {
          eventSubmit.preventDefault();
          onSave(form);
        }}
        className="mx-auto w-full max-w-[760px] rounded-[18px] bg-white px-6 py-7 shadow-[0_24px_50px_rgba(33,55,30,0.22)] sm:px-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#287630]">
              Evento docente
            </p>
            <h2 className="mt-2 text-[25px] font-black tracking-[-0.04em] text-[#1f6f2a]">
              Editar evento
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-2 text-[11px] font-black text-[#687266] transition hover:bg-[#f4f5f0]"
          >
            Fechar
          </button>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <EventEditorField
            label="Titulo"
            value={form.title}
            onChange={(value) => updateField("title", value)}
            required
          />
          <EventEditorField
            label="Categoria"
            value={form.category}
            onChange={(value) => updateField("category", value)}
            required
          />
          <EventEditorField
            label="Data"
            value={form.date}
            onChange={(value) => updateField("date", value)}
            required
          />
          <EventEditorField
            label="Horario"
            value={form.time}
            onChange={(value) => updateField("time", value)}
            required
          />
          <EventEditorField
            label="Local"
            value={form.location}
            onChange={(value) => updateField("location", value)}
            required
          />
          <EventEditorField
            label="Endereco"
            value={form.address}
            onChange={(value) => updateField("address", value)}
            required
          />
          <EventEditorField
            label="Imagem"
            value={form.image}
            onChange={(value) => updateField("image", value)}
          />
          <EventEditorField
            label="Tags"
            value={form.tags}
            onChange={(value) => updateField("tags", value)}
          />
        </div>
        <EventEditorArea
          label="Resumo curto"
          value={form.shortDescription}
          onChange={(value) => updateField("shortDescription", value)}
          required
        />
        <EventEditorArea
          label="Descricao completa"
          value={form.summary}
          onChange={(value) => updateField("summary", value)}
          required
        />
        <div className="mt-7 flex flex-col gap-3 border-t border-[#edf0e9] pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-full bg-[#eef0ea] px-6 text-[11px] font-black text-[#4f5b4e]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-11 rounded-full bg-[#287630] px-7 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]"
          >
            Salvar alteracoes
          </button>
        </div>
      </form>
    </div>
  );
}

function RegistrationsDialog({
  title,
  registrations,
  onClose,
}: {
  title: string;
  registrations: EventRegistrationRecord[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1f281f]/35 px-4 py-8 backdrop-blur-[4px]">
      <section className="mx-auto w-full max-w-[860px] rounded-[18px] bg-white px-6 py-7 shadow-[0_24px_50px_rgba(33,55,30,0.22)] sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#287630]">
              Inscricoes recebidas
            </p>
            <h2 className="mt-2 text-[25px] font-black tracking-[-0.04em] text-[#1f6f2a]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-[11px] font-black text-[#687266] transition hover:bg-[#f4f5f0]"
          >
            Fechar
          </button>
        </div>
        {registrations.length > 0 ? (
          <div className="mt-7 space-y-4">
            {registrations.map((registration) => (
              <article
                key={registration.id}
                className="rounded-[16px] border border-[#e6e8e0] bg-[#fbfcf7] p-5"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <RegistrationField label="Nome" value={registration.name} />
                  <RegistrationField label="Email" value={registration.email} />
                  <RegistrationField
                    label="Matricula"
                    value={registration.registration}
                  />
                  <RegistrationField
                    label="Curso ou setor"
                    value={registration.course}
                  />
                  <RegistrationField
                    label="Telefone"
                    value={registration.phone}
                  />
                  <RegistrationField
                    label="Data da inscricao"
                    value={new Date(
                      registration.registeredAt,
                    ).toLocaleString("pt-BR")}
                  />
                </div>
                <RegistrationField
                  label="Motivacao"
                  value={registration.motivation}
                  wide
                />
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-7 rounded-[16px] border border-dashed border-[#d8dbd2] px-5 py-8 text-center text-[12px] font-semibold text-[#65705f]">
            Este evento ainda nao recebeu inscricoes.
          </p>
        )}
      </section>
    </div>
  );
}

function EventEditorField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-[11px] font-black text-[#3c463b]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 h-11 w-full rounded-[14px] border border-[#e0e4db] bg-[#f7f8f3] px-4 text-[13px] font-medium text-[#262d25] outline-none transition focus:border-[#b6d8b8] focus:bg-white"
      />
    </label>
  );
}

function EventEditorArea({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="mt-5 block text-[11px] font-black text-[#3c463b]">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={4}
        className="mt-2 w-full resize-none rounded-[14px] border border-[#e0e4db] bg-[#f7f8f3] px-4 py-3 text-[13px] font-medium leading-6 text-[#262d25] outline-none transition focus:border-[#b6d8b8] focus:bg-white"
      />
    </label>
  );
}

function RegistrationField({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "mt-4" : ""}>
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#287630]">
        {label}
      </p>
      <p className="mt-1 break-words text-[12px] font-semibold leading-5 text-[#3f493d]">
        {value || "-"}
      </p>
    </div>
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
        <p>© 2024 SustentaRural - UFRPE</p>
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

