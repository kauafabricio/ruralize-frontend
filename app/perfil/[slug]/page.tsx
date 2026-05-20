import Link from "next/link";
import { notFound } from "next/navigation";

import { FeedHeader } from "../../components/feed/FeedHeader";
import { suggestions } from "../../lib/suggestions";
import { HeartIcon, MessageIcon, MoreIcon } from "../../components/feed/FeedIcons";

export default function UserProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = suggestions.find((person) => person.slug === params.slug);

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f8f3] text-[#222a20]">
      <FeedHeader />

      <div className="mx-auto max-w-[1132px] px-4 pb-20 pt-10 sm:px-6 lg:px-1">
        <div className="mb-6 flex items-center justify-between gap-3 text-sm font-black text-[#1f6f2a]">
          <Link
            href="/feed"
            className="rounded-full border border-[#d9e0d4] bg-white px-4 py-2 transition hover:bg-[#f4f6f1]"
          >
            Voltar ao feed
          </Link>
          <span className="rounded-full bg-[#e9f4e4] px-4 py-2 text-[#225f35]">
            Perfil público
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
          <div
            className="h-[174px] bg-[#d7e4c6] bg-cover bg-center"
            role="img"
            aria-label="Campo cultivado ao nascer do sol"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(23, 73, 27, 0.02), rgba(23, 73, 27, 0.12)), url("${profile.coverImage}")`,
            }}
          />

          <div className="relative px-6 pb-8 pt-[62px] sm:px-8 lg:px-9">
            <ProfileAvatar name={profile.name} color={profile.color} />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[620px]">
                <h1 className="text-[30px] font-black leading-tight tracking-[-0.03em] text-[#1e261e]">
                  {profile.name}
                </h1>
                <p className="mt-1 text-[13px] font-black text-[#287630]">
                  {profile.role}
                </p>
                <p className="mt-6 max-w-[590px] text-[12px] font-medium leading-6 text-[#545d50]">
                  {profile.bio}
                </p>
              </div>

              <div className="inline-flex h-10 items-center gap-2 rounded-full bg-[#eef8ea] px-5 text-[12px] font-black text-[#1f6f2a] shadow-[0_10px_18px_rgba(40,118,48,0.12)]">
                Perfil sugerido
              </div>
            </div>
          </div>
        </section>

        <div className="mt-9 grid gap-9 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-8">
            <AcademicInfoCard
              email={profile.email}
              roleDescription={profile.role}
              registration={profile.registration}
              location={profile.location}
            />
          </aside>

          <section aria-labelledby="profile-activities-title">
            <h2
              id="profile-activities-title"
              className="text-[15px] font-black tracking-[-0.02em] text-[#1e261e]"
            >
              Atividades recentes
            </h2>

            <ActivityPost displayName={profile.name} />
          </section>
        </div>
      </div>
    </main>
  );
}

function ProfileAvatar({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <div className="absolute left-6 top-[-58px] h-[116px] w-[116px] rounded-full bg-white p-[5px] shadow-[0_14px_28px_rgba(33,55,30,0.18)] sm:left-8 lg:left-9">
      <div className={`relative h-full w-full overflow-hidden rounded-full ${color}`}>
        <span className="absolute inset-0 flex items-center justify-center text-[26px] font-black text-white">
          {readInitials(name)}
        </span>
      </div>
    </div>
  );
}

function AcademicInfoCard({
  email,
  roleDescription,
  registration,
  location,
}: {
  email: string;
  roleDescription: string;
  registration: string;
  location: string;
}) {
  return (
    <section className="rounded-[22px] bg-white px-6 py-7 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="flex items-center gap-2 text-[#1e261e]">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e9f4e4] text-[#287630]">✓</span>
        <h2 className="text-[15px] font-black tracking-[-0.02em]">
          Informações do Perfil
        </h2>
      </div>

      <dl className="mt-7 space-y-6">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            E-mail institucional
          </dt>
          <dd className="mt-2 break-words text-[12px] font-semibold text-[#333b31]">
            {email}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Cargo / Função
          </dt>
          <dd className="mt-2 text-[12px] font-semibold text-[#333b31]">
            {roleDescription}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Matrícula
          </dt>
          <dd className="mt-2 text-[12px] font-semibold text-[#333b31]">
            {registration}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Localização
          </dt>
          <dd className="mt-2 flex items-center gap-2 text-[12px] font-semibold text-[#333b31]">
            <LocationIcon className="h-[14px] w-[14px] text-[#287630]" />
            {location}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function ActivityPost({ displayName }: { displayName: string }) {
  return (
    <article className="mt-5 overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#205f36] ring-2 ring-[#e8efdf]">
              <span className="absolute left-[11px] top-[7px] h-[10px] w-[15px] rounded-full bg-[#e9b37f]" />
              <span className="absolute top-[13px] left-[8px] h-[9px] w-[24px] rounded-t-full bg-[#352a20]" />
              <span className="absolute bottom-0 left-[7px] h-[18px] w-[27px] rounded-t-[16px] bg-[#dfead7]" />
              <span className="absolute bottom-[2px] left-[13px] h-[10px] w-[14px] rounded-t-full bg-[#275f35]" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[12px] font-black leading-4 text-[#242b23]">
                {displayName}
              </h3>
              <p className="truncate text-[10px] font-semibold leading-3 text-[#8a9186]">
                Postado há 2 horas
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#20281f] transition-colors hover:bg-[#f2f3ee]"
            aria-label="Mais opções da publicação"
          >
            <MoreIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-6 text-[13px] font-medium leading-6 text-[#30372f]">
          Ainda não há publicações recentes neste perfil. As atualizações aparecem
          quando o usuário interage com a plataforma.
        </p>
      </div>

      <div
        className="mt-6 h-[260px] bg-[#d7e6c8] bg-cover bg-center sm:h-[318px]"
        role="img"
        aria-label="Mudas verdes em cultivo"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(23, 73, 27, 0), rgba(23, 73, 27, 0.08)), url("${profile.coverImage}")`,
        }}
      />

      <div className="flex h-[64px] items-center gap-7 px-6 text-[#20281f]">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
          <HeartIcon className="h-[18px] w-[18px]" />
          24
        </span>
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
          <MessageIcon className="h-[18px] w-[18px]" />
          8
        </span>
      </div>
    </article>
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

function readInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "R";
}
