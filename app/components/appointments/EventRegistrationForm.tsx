"use client";

import { useMemo, useState, useEffect } from "react";

import type { EventResponse } from "@/app/services/api/events.api";
import { getMyEventRegistration } from "@/app/services/api/events.api";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { RegistrationConfirmationModal } from "./RegistrationConfirmationModal";

type EventRegistrationFormProps = {
  eventId: string;
  event: EventResponse;
};

type EventRegistrationData = {
  name: string;
  email: string;
  registration: string;
  course: string;
  phone: string;
  motivation: string;
  consent: boolean;
};

export function EventRegistrationForm({ eventId, event }: EventRegistrationFormProps) {
  const { user } = useAuth();
  const initialForm = useMemo<EventRegistrationData>(
    () => ({
      name: user?.name ?? "",
      email: user?.email ?? "",
      registration: readProfileValue(user?.raw, [
        "registration",
        "matricula",
        "enrollment",
      ]),
      course: readProfileValue(user?.raw, ["course", "curso"]),
      phone: "",
      motivation: "",
      consent: false,
    }),
    [user?.email, user?.name, user?.raw],
  );
  const [form, setForm] = useState(initialForm);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formDisabled, setFormDisabled] = useState(false);

  // Check if event has already started
  useEffect(() => {
    if (!event) return;

    const now = new Date();
    const eventStart = new Date(event.start_date);

    if (now >= eventStart) {
      setError(
        "Este evento já foi iniciado. Novas inscrições não são mais permitidas."
      );
      setFormDisabled(true);
    }
  }, [event]);

  // Load previous registration data if available
  useEffect(() => {
    const loadPreviousRegistration = async () => {
      if (!eventId) return;
      const previous = await getMyEventRegistration(eventId);
      if (previous) {
        setForm((current) => ({
          ...current,
          phone: previous.phone || current.phone,
          motivation: previous.motivation || current.motivation,
        }));
      }
    };
    loadPreviousRegistration();
  }, [eventId]);

  function handleFieldChange(
    field: keyof EventRegistrationData,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    if (error && !formDisabled) setError(null);
  }

  function validateRegistrationData(data: EventRegistrationData): string | null {
    if (!data.name?.trim()) return "Nome é obrigatório";
    if (!data.email?.trim()) return "E-mail é obrigatório";
    if (!isValidEmail(data.email)) return "E-mail inválido";
    if (!data.registration?.trim()) return "Matrícula é obrigatória";
    if (!data.course?.trim()) return "Curso é obrigatório";
    if (!data.phone?.trim()) return "Telefone é obrigatório";
    if (!data.motivation?.trim()) return "Motivação é obrigatória";
    if (!data.consent) return "Você deve aceitar os termos";
    return null;
  }

  function handleSubmit(eventSubmit: React.FormEvent) {
    eventSubmit.preventDefault();

    if (formDisabled) {
      return;
    }

    const validationError = validateRegistrationData(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setConfirmationOpen(true);
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[760px] rounded-xl border border-[#e6e8e0] bg-white px-6 py-7 shadow-[0_18px_42px_rgba(33,55,30,0.08)] sm:px-9 sm:py-9">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary-dark">
            Formulário de Inscrição
          </p>
          <h1 className="mt-3 text-[31px] font-black leading-tight tracking-[-0.04em] text-primary-dark sm:text-[40px]">
            {event.title}
          </h1>
          <p className="mt-4 max-w-[620px] text-[13px] font-medium leading-6 text-[#556050]">
            Preencha suas informações para confirmar interesse nesta atividade.
            A equipe responsável validará sua participação.
          </p>
        </div>

        <form
          className="mt-9 space-y-7"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              label="Nome completo"
              name="name"
              value={form.name}
              onChange={(value) => handleFieldChange("name", value)}
              autoComplete="name"
              required
              disabled={formDisabled}
            />
            <FormField
              label="E-mail institucional"
              name="email"
              type="email"
              value={form.email}
              onChange={(value) => handleFieldChange("email", value)}
              autoComplete="email"
              required
              disabled={formDisabled}
            />
            <FormField
              label="Matrícula"
              name="registration"
              value={form.registration}
              onChange={(value) => handleFieldChange("registration", value)}
              required
              disabled={formDisabled}
            />
            <FormField
              label="Curso ou setor"
              name="course"
              value={form.course}
              onChange={(value) => handleFieldChange("course", value)}
              required
              disabled={formDisabled}
            />
          </div>

          <FormField
            label="Telefone para contato"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(value) => handleFieldChange("phone", value)}
            autoComplete="tel"
            required
            disabled={formDisabled}
          />

          <label className="block">
            <span className="text-[11px] font-black text-[#3c463b]">
              Por que você deseja participar?
            </span>
            <textarea
              name="motivation"
              value={form.motivation}
              onChange={(event) =>
                handleFieldChange("motivation", event.target.value)
              }
              disabled={formDisabled}
              className="mt-2 min-h-[122px] w-full resize-none rounded-lg border border-[#e0e4db] bg-[#f7f8f3] px-4 py-4 text-[13px] font-medium leading-6 text-[#262d25] outline-none transition focus:border-[#b6d8b8] focus:bg-white disabled:bg-[#efefef] disabled:text-[#999] disabled:cursor-not-allowed"
              required
            />
          </label>

          <label className="flex items-start gap-3 rounded-lg bg-[#f7f8f3] px-4 py-4 text-[12px] font-semibold leading-5 text-[#556050]">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) =>
                handleFieldChange("consent", event.target.checked)
              }
              disabled={formDisabled}
              className="mt-1 h-4 w-4 accent-[#287630] disabled:cursor-not-allowed"
              required
            />
            Confirmo que minhas informações estão corretas e autorizo o contato
            da equipe do evento.
          </label>

          <div className="border-t border-[#edf0e9] pt-6">
            <button
              type="submit"
              disabled={formDisabled}
              className="flex h-12 w-full items-center justify-center rounded-full bg-primary-dark px-7 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.22)] transition hover:bg-primary-darker disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto"
            >
              Confirmar Inscrição
            </button>
          </div>
        </form>
      </section>

      {confirmationOpen ? (
        <RegistrationConfirmationModal
          eventHref={`/agendamentos/${eventId}`}
          eventId={eventId}
          registrationData={form}
          onClose={() => setConfirmationOpen(false)}
        />
      ) : null}
    </>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  autoComplete,
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-[#3c463b]">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="mt-2 h-12 w-full rounded-lg border border-[#e0e4db] bg-[#f7f8f3] px-4 text-[13px] font-medium text-[#262d25] outline-none transition focus:border-[#b6d8b8] focus:bg-white disabled:bg-[#efefef] disabled:text-[#999] disabled:cursor-not-allowed"
      />
    </label>
  );
}

function readProfileValue(
  raw: Record<string, unknown> | undefined,
  keys: string[],
) {
  if (!raw) {
    return "";
  }

  for (const key of keys) {
    const value = raw[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

