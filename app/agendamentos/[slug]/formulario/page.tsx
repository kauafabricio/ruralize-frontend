"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { EventRegistrationForm } from "@/app/components/appointments/EventRegistrationForm";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { getEvent, type EventResponse } from "@/app/services/api/events.api";

export default function AppointmentFormPage() {
  const params = useParams();
  const eventId = typeof params?.slug === "string" ? params.slug : "";

  const router = useRouter();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEvent(eventId);
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar evento");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <RequireAuth>
        <main className="min-h-screen bg-[#fbfbf7] text-[#1e261e]">
          <FeedHeader showSearch={false} />
          <div className="mx-auto w-full max-w-[1220px] px-4 pb-16 pt-10 sm:px-7">
            <div className="animate-pulse space-y-4">
              <div className="h-[120px] rounded bg-[#e0e5d8]" />
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
        <main className="min-h-screen bg-[#fbfbf7] text-[#1e261e]">
          <FeedHeader showSearch={false} />
          <div className="mx-auto w-full max-w-[1220px] px-4 pb-16 pt-10 sm:px-7">
            <div className="rounded-[10px] bg-red-50 p-4 text-red-700">
              {error || "Evento não encontrado"}
            </div>
            <button
              onClick={() => router.back()}
              className="mt-4 rounded-full bg-[#287630] px-6 py-2 text-white font-black"
            >
              Voltar
            </button>
          </div>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#fbfbf7] text-[#1e261e]">
        <FeedHeader showSearch={false} />
        <div className="mx-auto w-full max-w-[1220px] px-4 pb-16 pt-10 sm:px-7 lg:pt-12">
          <EventRegistrationForm eventId={eventId} event={event} />
        </div>
      </main>
    </RequireAuth>
  );
}
