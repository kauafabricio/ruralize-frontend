"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { events, type Appointment } from "@/app/lib/appointments";
import {
  createEventPayload,
  eventToAppointment,
  type UserEventInput,
} from "@/app/lib/userEvents";
import { useTeacherAccess } from "@/app/lib/useTeacherAccess";
import { createEvent, listEvents } from "@/app/services/api/events.api";

const emptyEventForm: UserEventInput = {
  title: "",
  date: "",
  time: "",
  location: "",
  address: "",
  category: "general",
  shortDescription: "",
  summary: "",
  image: "",
  tags: "",
  maxParticipants: "30",
  points: "10",
};

export default function ExplorarEventosPage() {
  const { user, isTeacher, loadingProfile } = useTeacherAccess();
  const [apiEvents, setApiEvents] = useState<Appointment[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<UserEventInput>(emptyEventForm);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const allEvents = [...apiEvents, ...events];

  useEffect(() => {
    refreshEvents();
  }, []);

  async function refreshEvents() {
    setLoadingEvents(true);
    setError(null);

    try {
      const backendEvents = await listEvents();
      setApiEvents(backendEvents.map(eventToAppointment));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel carregar eventos do backend.",
      );
    } finally {
      setLoadingEvents(false);
    }
  }

  async function handleCreateEvent(eventSubmit: React.FormEvent<HTMLFormElement>) {
    eventSubmit.preventDefault();

    if (!user?.id || !isTeacher) {
      setError("Apenas contas docentes podem criar eventos.");
      return;
    }

    setSavingEvent(true);
    setError(null);

    try {
      await createEvent(user.id, createEventPayload(form));
      await refreshEvents();
      setForm(emptyEventForm);
      setFormOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nao foi possivel criar o evento.",
      );
    } finally {
      setSavingEvent(false);
    }
  }

  return (
    <RequireAuth>
      <main className="flex min-h-screen flex-col bg-[#fbfbf7] text-[#1e261e]">
        <FeedHeader showSearch={false} />

        <div className="mx-auto w-full max-w-[1220px] flex-1 px-4 pb-16 pt-10 sm:px-7 lg:pt-11">
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
            ) : isTeacher ? (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#287630] px-7 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)] transition hover:bg-[#1f6428]"
                >
                  Criar evento
                </button>
              </div>
            ) : null}

            {error ? (
              <p className="mt-5 rounded-[14px] border border-[#f1c4c4] bg-[#fff7f7] px-4 py-3 text-[12px] font-semibold text-[#b92828]">
                {error}
              </p>
            ) : null}

            {loadingEvents ? (
              <p className="mt-10 text-[12px] font-semibold text-[#687266]">
                Carregando eventos...
              </p>
            ) : null}

            <div className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {allEvents.map((event) => (
                <EventCard
                  key={event.slug}
                  slug={event.slug}
                  category={event.category}
                  date={event.compactDate}
                  title={event.title}
                  description={event.shortDescription}
                  image={event.image}
                />
              ))}
            </div>
          </section>
        </div>

        <EventsFooter />
        {formOpen ? (
          <EventFormDialog
            form={form}
            onChange={setForm}
            onCancel={() => setFormOpen(false)}
            onSubmit={handleCreateEvent}
            saving={savingEvent}
          />
        ) : null}
      </main>
    </RequireAuth>
  );
}

function EventCard({
  slug,
  category,
  date,
  title,
  description,
  image,
}: {
  slug: string;
  category: string;
  date: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <article className="overflow-hidden rounded-[18px] bg-white shadow-[0_18px_42px_rgba(33,55,30,0.08)]">
      <div className="relative h-[176px] bg-[#dfe8d8]">
        <div
          className="h-full w-full bg-cover bg-center"
          role="img"
          aria-label={title}
          style={{ backgroundImage: `url("${image}")` }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-[#c9f7ca] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#287630] shadow-[0_8px_18px_rgba(33,55,30,0.12)]">
          {category}
        </span>
      </div>

      <div className="px-6 pb-7 pt-5">
        <p className="flex items-center gap-1.5 text-[10px] font-black text-[#287630]">
          <CalendarIcon className="h-[12px] w-[12px]" />
          {date}
        </p>

        <h2 className="mt-3 text-[19px] font-black leading-6 tracking-[-0.03em] text-[#1e261e]">
          {title}
        </h2>
        <p className="mt-3 min-h-[72px] text-[12px] font-medium leading-5 text-[#556050]">
          {description}
        </p>

        <Link
          href={`/agendamentos/${slug}`}
          className="mt-6 flex h-11 items-center justify-center rounded-full bg-[#287630] px-6 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)] transition hover:bg-[#1f6428]"
        >
          Quero Participar
        </Link>
      </div>
    </article>
  );
}

function EventFormDialog({
  form,
  onChange,
  onCancel,
  onSubmit,
  saving,
}: {
  form: UserEventInput;
  onChange: (form: UserEventInput) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}) {
  function updateField(field: keyof UserEventInput, value: string) {
    onChange({
      ...form,
      [field]: value,
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1f281f]/35 px-4 py-8 backdrop-blur-[4px]">
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-[760px] rounded-[18px] bg-white px-6 py-7 shadow-[0_24px_50px_rgba(33,55,30,0.22)] sm:px-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#287630]">
              Evento docente
            </p>
            <h2 className="mt-2 text-[25px] font-black tracking-[-0.04em] text-[#1f6f2a]">
              Criar evento
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
          <EventFormField
            label="Titulo"
            value={form.title}
            onChange={(value) => updateField("title", value)}
            required
          />
          <EventFormField
            label="Acao/categoria"
            value={form.category}
            onChange={(value) => updateField("category", value)}
            required
          />
          <EventFormField
            label="Data"
            type="date"
            value={form.date}
            onChange={(value) => updateField("date", value)}
            required
          />
          <EventFormField
            label="Horario"
            type="time"
            value={form.time}
            onChange={(value) => updateField("time", value)}
            required
          />
          <EventFormField
            label="Local"
            value={form.location}
            onChange={(value) => updateField("location", value)}
            required
          />
          <EventFormField
            label="Endereco"
            value={form.address}
            onChange={(value) => updateField("address", value)}
            required
          />
          <EventFormField
            label="Imagem"
            value={form.image}
            onChange={(value) => updateField("image", value)}
            placeholder="https://..."
          />
          <EventFormField
            label="Vagas"
            type="number"
            value={form.maxParticipants}
            onChange={(value) => updateField("maxParticipants", value)}
            required
          />
          <EventFormField
            label="Pontos"
            type="number"
            value={form.points}
            onChange={(value) => updateField("points", value)}
            required
          />
        </div>

        <EventFormArea
          label="Resumo curto"
          value={form.shortDescription}
          onChange={(value) => updateField("shortDescription", value)}
          required
        />
        <EventFormArea
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
            disabled={saving}
            className="h-11 rounded-full bg-[#287630] px-7 text-[11px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar evento"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EventFormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-[11px] font-black text-[#3c463b]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-11 w-full rounded-[14px] border border-[#e0e4db] bg-[#f7f8f3] px-4 text-[13px] font-medium text-[#262d25] outline-none transition focus:border-[#b6d8b8] focus:bg-white"
      />
    </label>
  );
}

function EventFormArea({
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
