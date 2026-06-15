"use client";

import Link from "next/link";

type RegistrationMissingFormModalProps = {
  formHref: string;
  onClose: () => void;
};

export function RegistrationMissingFormModal({
  formHref,
  onClose,
}: RegistrationMissingFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#d7ddd3]/70 px-4 py-8 backdrop-blur-[5px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-missing-title"
        className="w-full max-w-[356px] rounded-2xl bg-white px-8 pb-8 pt-9 text-center shadow-soft-lg"
      >
        <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#fff3d8] text-[#9a6a12]">
          <DocumentIcon className="h-8 w-8" />
        </div>

        <h2
          id="registration-missing-title"
          className="mt-7 text-[22px] font-black tracking-[-0.04em] text-primary-dark"
        >
          Formulário não preenchido
        </h2>
        <p className="mx-auto mt-3 max-w-[245px] text-[12px] font-semibold leading-5 text-[#4f594c]">
          Não encontramos uma resposta salva para este evento. Preencha o
          formulário antes de avançar.
        </p>

        <div className="mt-7 space-y-3">
          <Link
            href={formHref}
            className="flex h-12 w-full items-center justify-center rounded-full bg-primary-dark px-5 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.2)] transition hover:bg-primary-darker"
          >
            Ir para o formulário
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-full bg-[#676a72] px-5 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(33,55,30,0.14)] transition hover:bg-[#555a61]"
          >
            Voltar ao evento
          </button>
        </div>
      </section>
    </div>
  );
}

function DocumentIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

