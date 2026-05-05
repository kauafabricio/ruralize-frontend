"use client";

import { useState } from "react";
import { UserIcon } from "./AuthIcons";

type MatriculaInputProps = {
  className?: string;
  placeholder?: string;
};

const MATRICULA_LENGTH = 11;

export function MatriculaInput({
  className = "",
  placeholder = "Digite sua matricula",
}: MatriculaInputProps) {
  const [matricula, setMatricula] = useState("");

  const missingCharacters = MATRICULA_LENGTH - matricula.length;
  const showWarning = matricula.length > 0 && matricula.length < MATRICULA_LENGTH;

  return (
    <label className={`block ${className}`}>
      <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.14em] text-[#262b23]">
        Matricula
      </span>
      <span className="flex h-16 items-center gap-4 bg-[#e2e2df] px-4 text-[#768070]">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          <UserIcon />
        </span>
        <input
          name="matricula"
          value={matricula}
          onChange={(event) =>
            setMatricula(event.target.value.slice(0, MATRICULA_LENGTH))
          }
          minLength={MATRICULA_LENGTH}
          maxLength={MATRICULA_LENGTH}
          required
          inputMode="numeric"
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#283022] outline-none placeholder:text-[#93998e]"
        />
      </span>
      {showWarning ? (
        <span className="mt-2 block text-[10px] font-bold text-[#b15d2a]">
          Faltam {missingCharacters} caracteres para completar a matricula.
        </span>
      ) : null}
    </label>
  );
}
