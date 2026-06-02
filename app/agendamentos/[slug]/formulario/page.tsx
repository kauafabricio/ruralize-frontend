import { notFound } from "next/navigation";

import { EventRegistrationForm } from "@/app/components/appointments/EventRegistrationForm";
import { RequireAuth } from "@/app/components/auth/RequireAuth";
import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { events, findAppointment } from "../../../lib/appointments";

export function generateStaticParams() {
  return events.map((appointment) => ({
    slug: appointment.slug,
  }));
}

export default async function AppointmentFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const appointment = findAppointment(slug);

  if (!appointment) {
    notFound();
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
