"use client";

import { useMemo, useRef, useState } from "react";
import { GraduationIcon } from "./AuthIcons";

const courses = [
  "Administração — Bacharelado (presencial)",
  "Administração Pública — Bacharelado (EAD)",
  "Agroecologia — Bacharelado (presencial)",
  "Agronomia — Bacharelado (presencial)",
  "Ciência da Computação — Bacharelado (presencial)",
  "Ciências Biológicas — Bacharelado (presencial)",
  "Ciências do Consumo — Bacharelado (presencial)",
  "Ciências Econômicas — Bacharelado (presencial)",
  "Ciências Sociais — Bacharelado (presencial)",
  "Economia Doméstica — Bacharelado (presencial)",
  "Engenharia Agrícola e Ambiental — Bacharelado (presencial)",
  "Engenharia Ambiental — Bacharelado (presencial)",
  "Engenharia de Pesca — Bacharelado (presencial)",
  "Engenharia Florestal — Bacharelado (presencial)",
  "Gastronomia — Bacharelado (presencial)",
  "Medicina Veterinária — Bacharelado (presencial)",
  "Sistemas de Informação — Bacharelado (presencial)",
  "Sistemas de Informação — Bacharelado (EAD)",
  "Zootecnia — Bacharelado (presencial)",
  "Ciências Agrícolas — Licenciatura (presencial)",
  "Ciências Biológicas — Licenciatura (presencial)",
  "Computação — Licenciatura (presencial)",
  "Física — Licenciatura (presencial)",
  "Matemática — Licenciatura (presencial)",
  "Ciências Domésticas — Licenciatura (presencial)",
  "Artes Visuais — Licenciatura (EAD)",
];

type CourseSelectProps = {
  className?: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CourseSelect({ className = "" }: CourseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    if (!normalizedQuery) {
      return courses;
    }

    return courses.filter((course) =>
      normalize(course).includes(normalizedQuery),
    );
  }, [query]);

  function openList() {
    setIsOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function selectCourse(course: string) {
    setSelectedCourse(course);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className={`relative ${className}`}>
      <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.14em] text-[#262b23]">
        Curso
      </span>
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openList())}
        className="flex h-16 w-full items-center gap-4 bg-[#e2e2df] px-4 text-left text-[#768070]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          <GraduationIcon />
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-[13px] font-medium ${
            selectedCourse ? "text-[#283022]" : "text-[#93998e]"
          }`}
        >
          {selectedCourse || "Selecione seu curso"}
        </span>
        <span
          className={`h-2 w-2 shrink-0 rotate-45 border-b-2 border-r-2 border-[#687161] transition-transform ${
            isOpen ? "rotate-[225deg]" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <input type="hidden" name="curso" value={selectedCourse} />

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[18px] bg-white shadow-[0_24px_50px_rgba(33,55,30,0.18)]">
          <div className="border-b border-[#ecece8] p-3">
            <label className="flex h-12 items-center gap-3 bg-[#e2e2df] px-4 text-[#768070]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar curso"
                className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#283022] outline-none placeholder:text-[#93998e]"
              />
            </label>
          </div>

          <div
            className="max-h-64 overflow-y-auto py-2"
            role="listbox"
            aria-label="Cursos da UFRPE Recife"
          >
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <button
                  key={course}
                  type="button"
                  onClick={() => selectCourse(course)}
                  className={`block w-full px-5 py-3 text-left text-[12px] font-bold leading-5 transition-colors hover:bg-[#eef3e8] ${
                    selectedCourse === course
                      ? "bg-[#eef3e8] text-[#287630]"
                      : "text-[#4d5549]"
                  }`}
                  role="option"
                  aria-selected={selectedCourse === course}
                >
                  {course}
                </button>
              ))
            ) : (
              <p className="px-5 py-5 text-center text-[12px] font-semibold text-[#8c9388]">
                Nenhum curso encontrado.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
