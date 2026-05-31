"use client";

import Link from "next/link";

import { RequireAuth } from "../../components/auth/RequireAuth";
import { FeedHeader } from "../../components/feed/FeedHeader";
import { events } from "../../lib/appointments";

export default function ExplorarEventosPage() {
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
                Explore iniciativas e eventos sustentáveis na UFRPE. Sua
                participação gera impacto real e pontos de engajamento.
              </p>
            </div>

            <div className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
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

function EventsFooter() {
  return (
    <footer className="border-t border-[#eceee8] bg-[#fbfbf7]">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-4 px-4 py-8 text-[11px] font-semibold text-[#8a9186] sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p>
          <span className="font-black text-[#1e261e]">SustentaRural</span>
          <br />
          <span className="text-[10px]">© 2026 SustentaRural - UFRPE</span>
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

