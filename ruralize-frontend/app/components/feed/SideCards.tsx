"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon } from "./FeedIcons";
import { suggestions } from "@/app/lib/suggestions";

export function SuggestionsCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const visibleSuggestions = suggestions.slice(0, 3);

  return (
    <>
      <aside className="rounded-[28px] bg-white px-6 py-7 shadow-[0_1px_0_rgba(33,55,30,0.04)]">
        <h2 className="text-[15px] font-black tracking-[-0.02em] text-[#1e261e]">
          Sugestões
        </h2>

        <div className="mt-6 space-y-4">
          {visibleSuggestions.map((person, index) => (
            <Link
              key={person.slug}
              href={`/perfil/${person.slug}`}
              className="group flex items-center gap-3 rounded-[18px] px-3 py-3 transition hover:bg-[#f4f6f1]"
            >
              <ProfileAvatar color={person.color} variant={index} />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-black leading-4 text-[#242b23] group-hover:text-[#1f6f2a]">
                  {person.name}
                </p>
                <p className="truncate text-[10px] font-semibold leading-3 text-[#8a9186]">
                  {person.role}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#f1f5ed] px-4 py-3 text-[11px] font-black text-[#287630] transition hover:bg-[#e7f1df]"
        >
          Ver todas as sugestões
        </button>
      </aside>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f0b]/50 px-4 py-8"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[960px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(11,35,17,0.28)]"
          >
            <div className="flex flex-col gap-3 border-b border-[#e6efe4] px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-[18px] font-black tracking-[-0.02em] text-[#1e261e]">
                  Todas as sugestões
                </h2>
                <p className="mt-1 text-[12px] text-[#525b4f]">
                  Conecte-se com perfis que combinam com seu interesse em sustentabilidade e produção rural.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e0d4] bg-white text-[16px] font-black text-[#287630] transition hover:bg-[#f4f6f1]"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(100vh-210px)] overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-[#c7dabd] scrollbar-track-[#f4f6f1]">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((person) => (
                <Link
                  key={person.slug}
                  href={`/perfil/${person.slug}`}
                  className="group overflow-hidden rounded-[22px] border border-[#e6efe4] bg-[#fbfbf7] p-5 transition hover:border-[#c7dabd] hover:bg-white"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full ${person.color} ring-2 ring-[#e8efdf]`}>
                      <span className="flex h-full items-center justify-center text-[18px] font-black text-white">
                        {readInitials(person.name)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-black text-[#1e261e] group-hover:text-[#1f6f2a]">
                        {person.name}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-[#8a9186]">
                        {person.role}
                      </p>
                    </div>
                  </div>
                  <p className="mb-4 text-[12px] leading-6 text-[#545d50]">
                    {person.bio}
                  </p>
                  <div className="space-y-2 text-[11px] text-[#333b31]">
                    <div>
                      <span className="font-black">Email: </span>
                      {person.email}
                    </div>
                    <div>
                      <span className="font-black">Matrícula: </span>
                      {person.registration}
                    </div>
                    <div>
                      <span className="font-black">Local: </span>
                      {person.location}
                    </div>
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
    <aside className="flex min-h-[318px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d8dbd2] bg-[#fbfbf7] px-8 text-center">
      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3b8b42] text-white shadow-[0_10px_18px_rgba(40,118,48,0.18)]"
        aria-label="Novo agendamento"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      <h2 className="mt-8 text-[18px] font-black tracking-[-0.03em] text-[#1e261e]">
        Novo Agendamento
      </h2>
      <p className="mt-3 max-w-[235px] text-[11px] font-semibold leading-5 text-[#777f72]">
        Encontre novas atividades e participe da nossa comunidade.
      </p>

      <button
        type="button"
        className="mt-7 h-11 rounded-full bg-[#287630] px-8 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.22)]"
      >
        Explorar Eventos
      </button>
    </aside>
  );
}

function ProfileAvatar({
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

function readInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "R";
}
