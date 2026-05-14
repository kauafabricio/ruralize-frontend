"use client";

import { RequireAuth } from "../components/auth/RequireAuth";
import { useAuth } from "../components/auth/AuthProvider";
import { useState } from "react";
import { FeedHeader } from "../components/feed/FeedHeader";
import {
  HeartIcon,
  MessageIcon,
  MoreIcon,
} from "../components/feed/FeedIcons";

const coverImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85";
const avatarImage =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=85";
const activityImage =
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1400&q=85";

const suggestions = [
  {
    name: "Mariana Lima",
    role: "Engenharia Florestal",
    color: "bg-[#2f7d42]",
  },
  {
    name: "Roberto Silva",
    role: "Pesquisador UFRPE",
    color: "bg-[#286a7a]",
  },
];

export default function PerfilPage() {
  return (
    <RequireAuth>
      <PerfilContent />
    </RequireAuth>
  );
}

function PerfilContent() {
  const { user } = useAuth();
  const initialEmail = user?.email ?? "";
  const initialDisplayName =
    user?.name ?? readNameFromEmail(user?.email) ?? "";
  const initialCourse =
    readProfileValue(user?.raw, ["course", "curso"]) ?? "";
  const registration =
    readProfileValue(user?.raw, [
      "registration",
      "matricula",
      "enrollment",
      "studentRegistration",
    ]) ?? "Não informada";
  const roleLabel = formatRole(user?.role);

  const [editMode, setEditMode] = useState(false);
  const [savedName, setSavedName] = useState(initialDisplayName);
  const [savedEmail, setSavedEmail] = useState(initialEmail);
  const [savedCourse, setSavedCourse] = useState(initialCourse);
  const [editedName, setEditedName] = useState(initialDisplayName);
  const [editedEmail, setEditedEmail] = useState(initialEmail);
  const [editedCourse, setEditedCourse] = useState(initialCourse);

  const subtitle =
    roleLabel === "Professor"
      ? `Professor${savedCourse ? ` de ${savedCourse}` : ""} - UFRPE`
      : `Estudante${savedCourse ? ` de ${savedCourse}` : ""} - UFRPE`;

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f8f3] text-[#222a20]">
      <FeedHeader />

      <div className="mx-auto w-full max-w-[1132px] flex-1 px-4 pb-20 pt-10 sm:px-6 lg:px-1">
        <ProfileHero
          displayName={savedName}
          subtitle={subtitle}
          editMode={editMode}
          editedName={editedName}
          editedEmail={editedEmail}
          editedCourse={editedCourse}
          onNameChange={setEditedName}
          onEmailChange={setEditedEmail}
          onCourseChange={setEditedCourse}
          onToggleEdit={() => setEditMode((current) => !current)}
          onSave={() => {
            setSavedName(editedName);
            setSavedEmail(editedEmail);
            setSavedCourse(editedCourse);
            setEditMode(false);
          }}
          onCancel={() => {
            setEditedName(savedName);
            setEditedEmail(savedEmail);
            setEditedCourse(savedCourse);
            setEditMode(false);
          }}
        />

        <div className="mt-9 grid gap-9 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-8">
            <SuggestionsCard />
            <AcademicInfoCard
              email={savedEmail}
              course={savedCourse}
              registration={registration}
            />
          </aside>

          <section aria-labelledby="profile-activities-title">
            <h2
              id="profile-activities-title"
              className="text-[15px] font-black tracking-[-0.02em] text-[#1e261e]"
            >
              Minhas Atividades
            </h2>

            <ActivityPost displayName={savedName} />
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function ProfileHero({
  displayName,
  subtitle,
  editMode,
  editedName,
  editedEmail,
  editedCourse,
  onNameChange,
  onEmailChange,
  onCourseChange,
  onToggleEdit,
  onSave,
  onCancel,
}: {
  displayName: string;
  subtitle: string;
  editMode: boolean;
  editedName: string;
  editedEmail: string;
  editedCourse: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div
        className="h-[174px] bg-[#d7e4c6] bg-cover bg-center"
        role="img"
        aria-label="Campo cultivado ao nascer do sol"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(23, 73, 27, 0.02), rgba(23, 73, 27, 0.12)), url("${coverImage}")`,
        }}
      />

      <div className="relative px-6 pb-8 pt-[62px] sm:px-8 lg:px-9">
        <ProfileAvatar name={displayName} />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[620px]">
            <h1 className="text-[30px] font-black leading-tight tracking-[-0.03em] text-[#1e261e]">
              {displayName}
            </h1>
            <p className="mt-1 text-[13px] font-black text-[#287630]">
              {subtitle}
            </p>

            {editMode ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8a9186]">
                    Nome completo
                  </span>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(event) => onNameChange(event.target.value)}
                    className="mt-2 w-full rounded-[18px] border border-[#e3e7de] bg-[#f8f8f3] px-4 py-3 text-[13px] text-[#20281f] outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8a9186]">
                    Curso
                  </span>
                  <input
                    type="text"
                    value={editedCourse}
                    onChange={(event) => onCourseChange(event.target.value)}
                    className="mt-2 w-full rounded-[18px] border border-[#e3e7de] bg-[#f8f8f3] px-4 py-3 text-[13px] text-[#20281f] outline-none"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8a9186]">
                    Email institucional
                  </span>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(event) => onEmailChange(event.target.value)}
                    className="mt-2 w-full rounded-[18px] border border-[#e3e7de] bg-[#f8f8f3] px-4 py-3 text-[13px] text-[#20281f] outline-none"
                  />
                </label>
              </div>
            ) : (
              <p className="mt-6 max-w-[590px] text-[12px] font-medium leading-6 text-[#545d50]">
                Perfil carregado a partir dos dados da sua conta. Atualize seu
                nome, curso ou email abaixo para manter as informações do seu
                perfil sempre corretas.
              </p>
            )}

          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={editMode ? onSave : onToggleEdit}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-[#95ee9d] px-6 text-[12px] font-black text-[#1f6f2a] shadow-[0_10px_18px_rgba(40,118,48,0.12)] transition-colors hover:bg-[#82e78d]"
            >
              <PencilIcon className="h-[14px] w-[14px]" />
              {editMode ? "Salvar" : "Editar Perfil"}
            </button>
            {editMode ? (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-10 w-fit items-center justify-center rounded-full border border-[#c7cfc1] bg-white px-6 text-[12px] font-black text-[#20281f] transition-colors hover:bg-[#f4f5f0]"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileAvatar({ name }: { name: string }) {
  return (
    <div className="absolute left-6 top-[-58px] h-[116px] w-[116px] rounded-full bg-white p-[5px] shadow-[0_14px_28px_rgba(33,55,30,0.18)] sm:left-8 lg:left-9">
      <div className="relative h-full w-full overflow-hidden rounded-full bg-[#287630]">
        <span className="absolute inset-0 flex items-center justify-center text-[26px] font-black text-white">
          {readInitials(name)}
        </span>
        <span
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${avatarImage}")` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function SuggestionsCard() {
  return (
    <section className="rounded-[22px] bg-white px-6 py-7 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <h2 className="text-[15px] font-black tracking-[-0.02em] text-[#1e261e]">
        Sugestões
      </h2>

      <div className="mt-6 space-y-4">
        {suggestions.map((person, index) => (
          <div key={person.name} className="flex items-center gap-3">
            <MiniAvatar color={person.color} variant={index} />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-black leading-4 text-[#242b23]">
                {person.name}
              </p>
              <p className="truncate text-[10px] font-semibold leading-3 text-[#8a9186]">
                {person.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-7 w-full text-center text-[11px] font-black text-[#287630]"
      >
        Ver todas as sugestões
      </button>
    </section>
  );
}

function AcademicInfoCard({
  email,
  course,
  registration,
}: {
  email: string;
  course: string;
  registration: string;
}) {
  return (
    <section className="rounded-[22px] bg-white px-6 py-7 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
      <div className="flex items-center gap-2 text-[#1e261e]">
        <LeafIcon className="h-[16px] w-[16px] text-[#287630]" />
        <h2 className="text-[15px] font-black tracking-[-0.02em]">
          Informações Acadêmicas
        </h2>
      </div>

      <dl className="mt-7 space-y-6">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Email institucional
          </dt>
          <dd className="mt-2 break-words text-[12px] font-semibold text-[#333b31]">
            {email}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0a69b]">
            Curso
          </dt>
          <dd className="mt-2 text-[12px] font-semibold text-[#333b31]">
            {course}
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
            Campus Dois Irmãos
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
            <MiniAvatar color="bg-[#205f36]" variant={0} />
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
          Ainda não há publicações recentes no seu perfil. As atualizações do
          feed estarão disponíveis assim que você começar a usar a plataforma.
        </p>
      </div>

      <div
        className="mt-6 h-[260px] bg-[#d7e6c8] bg-cover bg-center sm:h-[318px]"
        role="img"
        aria-label="Mudas verdes em cultivo"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(23, 73, 27, 0), rgba(23, 73, 27, 0.08)), url("${activityImage}")`,
        }}
      />

      <div className="flex h-[64px] items-center gap-7 px-6 text-[#20281f]">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
          <HeartIcon className="h-[18px] w-[18px]" />
          24
        </span>
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
          <MessageIcon className="h-[18px] w-[18px]" />8
        </span>
      </div>
    </article>
  );
}

function MiniAvatar({
  color,
  variant,
}: {
  color: string;
  variant: number;
}) {
  return (
    <div
      className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full ${color} ring-2 ring-[#e8efdf]`}
    >
      <span className="absolute left-[11px] top-[7px] h-[10px] w-[15px] rounded-full bg-[#e9b37f]" />
      <span
        className={`absolute top-[13px] h-[9px] rounded-t-full ${
          variant === 0
            ? "left-[8px] w-[24px] bg-[#352a20]"
            : "left-[10px] w-[20px] bg-[#183f42]"
        }`}
      />
      <span className="absolute bottom-0 left-[7px] h-[18px] w-[27px] rounded-t-[16px] bg-[#dfead7]" />
      <span className="absolute bottom-[2px] left-[13px] h-[10px] w-[14px] rounded-t-full bg-[#275f35]" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#eceee8] bg-[#fbfbf7] py-10 text-center">
      <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.18em] text-[#b4b9af]">
        <a href="#" className="transition-colors hover:text-[#287630]">
          Sobre
        </a>
        <a href="#" className="transition-colors hover:text-[#287630]">
          Contato
        </a>
        <a href="#" className="transition-colors hover:text-[#287630]">
          UFRPE
        </a>
      </div>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c0c5bb]">
        &copy; 2026 Ruralize UFRPE
      </p>
    </footer>
  );
}

function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="m16.9 4.1 3 3L8 19l-4 1 1-4Z" />
      <path d="m14.5 6.5 3 3" />
    </svg>
  );
}

function LeafIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M5 21c8 0 14-6 14-14V3h-4C7 3 3 8 3 14c0 3 2 5 5 5" />
      <path d="M9 15c2-4 5-6 10-8" />
    </svg>
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

function readProfileValue(
  raw: Record<string, unknown> | undefined,
  keys: string[],
) {
  if (!raw) {
    return null;
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

  return null;
}

function readNameFromEmail(email: string | undefined) {
  if (!email) {
    return null;
  }

  const [namePart] = email.split("@");

  if (!namePart) {
    return null;
  }

  return namePart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "R";
}

function formatRole(role: string | undefined) {
  if (role === "teacher" || role === "professor") {
    return "Professor";
  }

  return "Estudante";
}
