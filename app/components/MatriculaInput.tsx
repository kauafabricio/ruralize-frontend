"use client";

import { UserIcon } from "./AuthIcons";

type MatriculaInputProps = {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const MATRICULA_LENGTH = 11;

export function MatriculaInput({
  className = "",
  placeholder = "Digite sua matrícula",
  value = "",
  onChange,
}: MatriculaInputProps) {
  const missingCharacters = MATRICULA_LENGTH - value.length;
  const showWarning = value.length > 0 && value.length < MATRICULA_LENGTH;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Permite apenas números.
    const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, MATRICULA_LENGTH);

    // cria um "evento fake" com valor limpo
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: onlyNumbers,
      },
    };

    onChange?.(newEvent as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <label className={`block ${className}`}>
      <span className="mb-3 block text-xs font-bold uppercase tracking-[0.14em] text-neutral-darker">
        Matrícula
      </span>

      <span className="flex h-16 items-center gap-4 bg-white">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          <UserIcon />
        </span>

        <input
          name="matricula"
          value={value}
          onChange={handleChange}
          minLength={MATRICULA_LENGTH}
          maxLength={MATRICULA_LENGTH}
          required
          inputMode="numeric"
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-darker"
        />
      </span>

      {showWarning && (
        <span className="mt-2 block text-xs font-bold text-neutral-darker">
          Faltam {missingCharacters} caracteres para completar a matrícula.
        </span>
      )}
    </label>
  );
}
