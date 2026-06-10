"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EventRegistrationForm } from "@/app/components/appointments/EventRegistrationForm";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { findAppointment, type Appointment } from "../../../lib/appointments";
import { eventToAppointment, readCreatedEvent } from "@/app/lib/userEvents";
import { getEvent } from "@/app/services/api/events.api";

export default function AppointmentFormPage() {
  const params = useParams<{ slug: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const slug = params.slug;
    const localAppointment = findAppointment(slug) ?? readCreatedEvent(slug);

    if (localAppointment) {
      setAppointment(localAppointment);
      setLoaded(true);
      return;
    }

    getEvent(slug)
      .then((event) => setAppointment(eventToAppointment(event)))
      .catch(() => setAppointment(null))
      .finally(() => setLoaded(true));
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
              O formulario deste evento nao esta disponivel.
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
        <div className="mx-auto w-full max-w-[1220px] px-4 pb-16 pt-10 sm:px-7 lg:pt-12">
          <EventRegistrationForm event={appointment} />
        </div>
      </main>
    </RequireAuth>
  );
}
