import Link from "next/link";

import { FeedHeader } from "@/app/components/feed/FeedHeader";
import { suggestions } from "@/app/lib/suggestions";
import { HeartIcon, MessageIcon, MoreIcon } from "@/app/components/feed/FeedIcons";

export default function SuggestionsPage() {
  return (
    <main className="min-h-screen bg-neutral-lighter text-[#222a20]">
      <FeedHeader />

      <div className="mx-auto max-w-[1132px] px-4 pb-20 pt-10 sm:px-6 lg:px-1">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em] text-neutral-darker">
              Sugestões para você se conectar
            </h1>
            <p className="mt-2 max-w-[700px] text-[13px] font-medium text-[#545d50]">
              Explore perfis relevantes e encontre pessoas com interesses em agricultura regenerativa, sustentabilidade e inovação rural.
            </p>
          </div>
          <Link
            href="/feed"
            className="inline-flex h-11 items-center justify-center rounded-full border border-pastel-support bg-white px-6 text-[12px] font-black text-primary-dark transition hover:bg-neutral-lighter"
          >
            Voltar ao feed
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((profile) => (
            <article
              key={profile.slug}
              className="overflow-hidden rounded-3xl bg-white shadow-soft-xs"
            >
              <div
                className="h-[160px] bg-cover bg-center"
                style={{ backgroundImage: `url("${profile.coverImage}")` }}
              />
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full ${profile.color} ring-2 ring-neutral-lighter`}>
                    <span className="flex h-full items-center justify-center text-[18px] font-black text-white">
                      {readInitials(profile.name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-black text-neutral-darker">
                      {profile.name}
                    </h2>
                    <p className="truncate text-[11px] font-semibold text-neutral-muted">
                      {profile.role}
                    </p>
                  </div>
                </div>

                <p className="mb-5 text-[12px] leading-6 text-[#545d50]">
                  {profile.bio}
                </p>

                <div className="mb-5 space-y-3 text-[12px] text-[#333b31]">
                  <div>
                    <span className="font-black">E-mail: </span>
                    {profile.email}
                  </div>
                  <div>
                    <span className="font-black">Matrícula: </span>
                    {profile.registration}
                  </div>
                  <div>
                    <span className="font-black">Local: </span>
                    {profile.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/perfil/${profile.slug}`}
                    className="rounded-full bg-primary-dark px-4 py-2 text-[12px] font-black text-white transition hover:bg-primary-dark"
                  >
                    Ver perfil
                  </Link>
                  <button
                    type="button"
                    className="rounded-full border border-pastel-support bg-white px-4 py-2 text-[12px] font-black text-primary-dark transition hover:bg-neutral-lighter"
                  >
                    Conectar
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-3 text-[12px] text-neutral-muted">
                  <span className="inline-flex items-center gap-1">
                    <HeartIcon className="h-4 w-4" /> 24
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageIcon className="h-4 w-4" /> 8
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MoreIcon className="h-4 w-4" /> Detalhes
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function readInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "R";
}
