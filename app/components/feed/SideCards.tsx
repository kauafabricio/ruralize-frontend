"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "./FeedIcons";
import {
  getAllProfiles,
  type UserProfileResponse,
} from "@/app/services/api/profile.api";

export function SuggestionsCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfileResponse[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const visibleSuggestions = profiles.slice(0, 3);

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      setLoadingProfiles(true);
      setProfileError(null);

      try {
        const data = await getAllProfiles();

        if (!cancelled) {
          setProfiles(data);
        }
      } catch (err) {
        if (!cancelled) {
          setProfileError(
            err instanceof Error ? err.message : "Erro ao carregar sugestões",
          );
          setProfiles([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProfiles(false);
        }
      }
    }

    loadProfiles();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <aside className="rounded-2xl bg-white px-6 py-7 shadow-soft-xs">
        <h2 className="text-[15px] font-bold tracking-[-0.02em] text-neutral-darker">
          Sugestões
        </h2>

        <div className="mt-6 space-y-4">
          {loadingProfiles ? (
            <p className="text-xs font-semibold text-neutral-muted">
              Carregando perfis...
            </p>
          ) : profileError ? (
            <p className="text-xs font-semibold text-neutral-darker">
              {profileError}
            </p>
          ) : visibleSuggestions.length === 0 ? (
            <p className="text-xs font-semibold text-neutral-muted">
              Nenhuma sugestão encontrada.
            </p>
          ) : (
            visibleSuggestions.map((person) => (
              <Link
                key={person.id}
                href={`/perfil/${person.id}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white"
              >
                <ProfileAvatar profile={person} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold leading-4 text-neutral-darker group-hover:text-primary-dark">
                    {person.name}
                  </p>
                  <p className="truncate text-xs font-semibold leading-3 text-neutral-muted">
                    {person.course || person.department || person.role}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={profiles.length === 0}
          className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Ver todas as sugestões
        </button>
      </aside>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 px-4 py-8"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-soft"
          >
            <div className="flex flex-col gap-3 border-b border-pastel-support px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.02em] text-neutral-darker">
                  Todas as sugestões
                </h2>
                <p className="mt-1 text-xs text-neutral-darker">
                  Perfis carregados diretamente do backend Ruralize.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pastel-support bg-white text-[16px] font-bold text-primary-dark transition hover:bg-white"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(100vh-210px)] overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-[#c7dabd] scrollbar-track-[#f4f6f1]">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((person) => (
                  <Link
                    key={person.id}
                    href={`/perfil/${person.id}`}
                    className="group overflow-hidden rounded-2xl border border-[#e6efe4] bg-white p-5 transition hover:border-[#c7dabd] hover:bg-white"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <ProfileAvatar profile={person} size="large" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-neutral-darker group-hover:text-primary-dark">
                          {person.name}
                        </p>
                        <p className="truncate text-xs font-semibold text-neutral-muted">
                          {person.course || person.department || person.role}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 text-xs leading-6 text-neutral-darker">
                      {person.description || "Perfil Ruralize"}
                    </p>
                    <div className="space-y-2 text-xs text-neutral-darker">
                      {person.course ? (
                        <div>
                          <span className="font-bold">Curso: </span>
                          {person.course}
                        </div>
                      ) : null}
                      {person.department ? (
                        <div>
                          <span className="font-bold">Departamento: </span>
                          {person.department}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function NewScheduleCard() {
  return (
    <aside className="flex min-h-[318px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8dbd2] bg-white px-8 text-center">
      <Link
        href="/agendamentos"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-white shadow-soft-sm"
        aria-label="Novo agendamento"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>

      <h2 className="mt-8 text-[18px] font-bold tracking-[-0.03em] text-neutral-darker">
        Novo Agendamento
      </h2>
      <p className="mt-3 max-w-[235px] text-xs font-semibold leading-5 text-neutral-darker">
        Encontre novas atividades e participe da nossa comunidade.
      </p>

      <Link
        href="/agendamentos"
        className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-primary-dark px-8 text-xs font-bold text-white shadow-soft"
      >
        Explorar Eventos
      </Link>
    </aside>
  );
}

function ProfileAvatar({
  profile,
  size = "small",
}: {
  profile: UserProfileResponse;
  size?: "small" | "large";
}) {
  const sizeClass =
    size === "large" ? "h-12 w-12 text-[18px]" : "h-10 w-10 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-dark font-bold text-white ring-2 ring-neutral-lighter ${sizeClass}`}
    >
      {profile.profile_photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.profile_photo_url}
          alt={profile.name}
          className="h-full w-full object-cover"
        />
      ) : (
        readInitials(profile.name)
      )}
    </div>
  );
}

function readInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "R"
  );
}
