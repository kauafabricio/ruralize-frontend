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
  value?: string;
  onChange?: (value: string) => void;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CourseSelect({
  className = "",
  value = "",
  onChange,
}: CourseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    if (!normalizedQuery) return courses;

    return courses.filter((course) =>
      normalize(course).includes(normalizedQuery),
    );
  }, [query]);

  function openList() {
    setIsOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function selectCourse(course: string) {
    onChange?.(course); // 🔥 AGORA ATUALIZA O PAI
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
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <GraduationIcon />
        </span>

        <span
          className={`min-w-0 flex-1 truncate text-[13px] font-medium ${
            value ? "text-[#283022]" : "text-[#93998e]"
          }`}
        >
          {value || "Selecione seu curso"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-[18px] bg-white shadow-[0_24px_50px_rgba(33,55,30,0.18)]">
          <div className="border-b p-3">
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar curso"
              className="w-full bg-[#e2e2df] px-4 h-12 outline-none"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-2">
            {filteredCourses.map((course) => (
              <button
                key={course}
                type="button"
                onClick={() => selectCourse(course)}
                className="block w-full px-5 py-3 text-left text-[12px] hover:bg-[#eef3e8]"
              >
                {course}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}