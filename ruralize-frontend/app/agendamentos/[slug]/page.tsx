"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { RegistrationActions } from "@/app/components/appointments/RegistrationActions";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { findAppointment, type Appointment } from "@/app/lib/appointments";
import { readCreatedEvent } from "@/app/lib/userEvents";

export default function AppointmentDetailsPage() {
  const params = useParams<{ slug: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const slug = params.slug;
    setAppointment(findAppointment(slug) ?? readCreatedEvent(slug));
    setLoaded(true);
  }, [params.slug]);

  if (loaded && !appointment) {
    return (
      <RequireAuth>
        <main className="min-h-screen bg-[#fbfbf7] text-[#1e261e]">
          <FeedHeader showSearch={false} />
          <section className="mx-auto w-full max-w-[760px] px-4 py-16 text-center sm:px-7">
            <h1 className="text-[28px] font-black text-[#1f6f2a]">
              Evento nao encontrado
            </h1>
            <p className="mt-3 text-[13px] font-semibold text-[#65705f]">
              O evento pode ter sido removido ou ainda nao esta disponivel.
            </p>
          </section>
        </main>
      </RequireAuth>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#fbfbf7] text-[#1e261e]">
        <FeedHeader showSearch={false} />

        <div className="mx-auto grid w-full max-w-[1220px] gap-10 px-4 pb-16 pt-10 sm:px-7 lg:grid-cols-[minmax(0,650px)_460px] lg:gap-14 lg:pt-12">
          <section aria-labelledby="event-title">
            <h1
              id="event-title"
              className="max-w-[560px] text-[39px] font-black leading-[1.04] tracking-[-0.05em] text-[#1f6f2a] sm:text-[53px]"
            >
              {appointment.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-3">
              {appointment.tags.map((tag, index) => (
                <span
                  key={tag}
                  className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] ${
                    index === 0
                      ? "bg-[#c9f7ca] text-[#287630]"
                      : "bg-[#e5e6e1] text-[#596255]"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-12 max-w-[620px] text-[14px] font-medium leading-7 text-[#465142]">
              {appointment.summary}
            </p>

            <dl className="mt-12 space-y-8">
              <DetailItem
                icon={<LocationIcon className="h-[17px] w-[17px]" />}
                label="Local"
                title={appointment.location}
                description={appointment.address}
              />
              <DetailItem
                icon={<ClockIcon className="h-[17px] w-[17px]" />}
                label="Horário"
                title={appointment.time}
                description="Duração prevista: 2 horas"
              />
              <DetailItem
                icon={<PersonIcon className="h-[17px] w-[17px]" />}
                label="Responsável"
                title={appointment.organizer}
                description={appointment.organizerRole}
                avatar
              />
            </dl>
          </section>

          <aside className="lg:pt-1">
            <div
              className="h-[260px] rounded-[8px] bg-[#dce9d3] bg-cover bg-center shadow-[0_18px_40px_rgba(33,55,30,0.12)] sm:h-[360px]"
              role="img"
              aria-label={appointment.title}
              style={{ backgroundImage: `url("${appointment.image}")` }}
            />

            <section className="mt-8 rounded-[10px] border border-[#e6e8e0] bg-white px-8 py-8 shadow-[0_10px_28px_rgba(33,55,30,0.05)]">
              <h2 className="text-[18px] font-black tracking-[-0.03em] text-[#1e261e]">
                Garanta sua vaga
              </h2>
              <p className="mt-4 text-[12px] font-medium leading-5 text-[#566052]">
                As vagas são limitadas para garantir o aprendizado prático de
                todos os participantes. Inscreva-se agora para receber o
                material de apoio.
              </p>

              <RegistrationActions
                eventHref="/agendamentos"
                eventSlug={appointment.slug}
                formHref={`/agendamentos/${appointment.slug}/formulario`}
              />

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
      <dt className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4f5df] text-[#287630]">
        {icon}
      </dt>
      <dd>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#287630]">
          {label}
        </p>
        <div className="mt-2 flex items-center gap-3">
          {avatar ? (
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#225f35] ring-2 ring-[#e8efdf]">
              <span className="absolute inset-x-[9px] top-[7px] h-[10px] rounded-full bg-[#f0b07b]" />
              <span className="absolute left-[11px] top-[14px] h-[8px] w-[18px] rounded-t-full bg-[#273f2a]" />
              <span className="absolute bottom-0 left-[7px] h-[19px] w-[26px] rounded-t-[16px] bg-[#e2ead8]" />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-[13px] font-black leading-5 text-[#1f281f]">
              {title}
            </p>
            <p className="text-[11px] font-semibold leading-5 text-[#687266]">
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

