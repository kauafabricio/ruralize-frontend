"use client";

import { useEffect, useMemo, useState } from "react";

import type { Appointment } from "@/app/lib/appointments";
import {
  EventRegistrationData,
  readRegistrationForm,
  saveRegistrationForm,
} from "@/app/lib/eventRegistration";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { RegistrationConfirmationModal } from "./RegistrationConfirmationModal";

type EventRegistrationFormProps = {
  event: Appointment;
};

export function EventRegistrationForm({ event }: EventRegistrationFormProps) {
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
  const [form, setForm] = useState<EventRegistrationData>(initialForm);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    const syncSavedFormTimeout = window.setTimeout(() => {
      setForm(readRegistrationForm(event.slug) ?? initialForm);
    }, 0);

    return () => {
      window.clearTimeout(syncSavedFormTimeout);
    };
  }, [event.slug, initialForm]);

  function handleFieldChange(
    field: keyof EventRegistrationData,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[760px] rounded-[18px] border border-[#e6e8e0] bg-white px-6 py-7 shadow-[0_18px_42px_rgba(33,55,30,0.08)] sm:px-9 sm:py-9">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#287630]">
            Formulário de Inscrição
          </p>
          <h1 className="mt-3 text-[31px] font-black leading-tight tracking-[-0.04em] text-[#1f6f2a] sm:text-[40px]">
            {event.title}
          </h1>
          <p className="mt-4 max-w-[620px] text-[13px] font-medium leading-6 text-[#556050]">
            Preencha suas informações para confirmar interesse nesta atividade.
            A equipe responsável validará sua participação.
          </p>
        </div>

        <form
          className="mt-9 space-y-7"
          onSubmit={(eventSubmit) => {
            eventSubmit.preventDefault();
            saveRegistrationForm(event.slug, form);
            setConfirmationOpen(true);
          }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              label="Nome completo"
              name="name"
              value={form.name}
              onChange={(value) => handleFieldChange("name", value)}
              autoComplete="name"
              required
            />
            <FormField
              label="E-mail institucional"
              name="email"
              type="email"
              value={form.email}
              onChange={(value) => handleFieldChange("email", value)}
              autoComplete="email"
              required
            />
            <FormField
              label="Matrícula"
              name="registration"
              value={form.registration}
              onChange={(value) => handleFieldChange("registration", value)}
              required
            />
            <FormField
              label="Curso ou setor"
              name="course"
              value={form.course}
              onChange={(value) => handleFieldChange("course", value)}
              required
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
              className="mt-2 min-h-[122px] w-full resize-none rounded-[14px] border border-[#e0e4db] bg-[#f7f8f3] px-4 py-4 text-[13px] font-medium leading-6 text-[#262d25] outline-none transition focus:border-[#b6d8b8] focus:bg-white"
              required
            />
          </label>

          <label className="flex items-start gap-3 rounded-[14px] bg-[#f7f8f3] px-4 py-4 text-[12px] font-semibold leading-5 text-[#556050]">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) =>
                handleFieldChange("consent", event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-[#287630]"
              required
            />
            Confirmo que minhas informações estão corretas e autorizo o contato
            da equipe do evento.
          </label>

          <div className="border-t border-[#edf0e9] pt-6">
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#287630] px-7 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.22)] transition hover:bg-[#1f6428] sm:w-auto"
            >
              Confirmar Inscrição
            </button>
          </div>
        </form>
      </section>

      {confirmationOpen ? (
        <RegistrationConfirmationModal
          eventHref="/agendamentos"
          eventSlug={event.slug}
          registerOnConfirm
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
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
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
        className="mt-2 h-12 w-full rounded-[14px] border border-[#e0e4db] bg-[#f7f8f3] px-4 text-[13px] font-medium text-[#262d25] outline-none transition focus:border-[#b6d8b8] focus:bg-white"
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


