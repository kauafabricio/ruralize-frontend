"use client";

interface ProfileCompletionModalProps {
  missingFields: string[];
  onContinue: () => void;
}

export function ProfileCompletionModal({
  missingFields,
  onContinue,
}: ProfileCompletionModalProps) {
  const fieldLabels: Record<string, string> = {
    description: "Descrição de perfil",
    campus_location: "Localização do campus",
    department: "Departamento",
    profile_photo_url: "Foto de perfil",
    cover_photo_url: "Foto de capa",
  };

  const requiredFields = [
    "description",
    "campus_location",
    "department",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173b22]/72 px-4 py-8 backdrop-blur-[5px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-modal-title"
        className="relative w-full max-w-[480px] overflow-hidden rounded-[24px] bg-[#fffef9] px-8 pb-10 pt-10 text-center shadow-[0_24px_70px_rgba(11,35,17,0.28)]"
      >
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#e9f4e4] shadow-[0_0_40px_rgba(149,238,157,0.64)]">
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#287630]">
            <LeafIcon className="h-[22px] w-[22px] text-white" />
          </span>
        </div>

        <h2
          id="completion-modal-title"
          className="mx-auto mt-6 max-w-[320px] text-[26px] font-black leading-tight tracking-[-0.02em] text-[#1f6f2a]"
        >
          Perfil Incompleto
        </h2>

        <p className="mx-auto mt-4 max-w-[360px] text-[13px] font-medium leading-6 text-[#5d6659]">
          Para usar plenamente a plataforma, você precisa completar alguns campos de seu perfil.
        </p>

        <div className="mt-8 rounded-[16px] bg-[#f8faf6] p-6 text-left">
          <p className="text-[12px] font-black uppercase tracking-[0.12em] text-[#287630]">
            Campos necessários
          </p>
          <ul className="mt-4 space-y-3">
            {missingFields.map((field) => (
              <li
                key={field}
                className="flex items-start gap-3 text-[13px] font-medium text-[#545d50]"
              >
                <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#287630]">
                  <span className="text-white">✓</span>
                </span>
                <span>{fieldLabels[field] || field}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 h-12 w-full rounded-full bg-[#287630] text-[13px] font-black text-white shadow-[0_10px_18px_rgba(40,118,48,0.26)] transition-colors hover:bg-[#1f6428]"
        >
          Completar Perfil Agora
        </button>

        <p className="mt-5 text-center text-[12px] font-medium text-[#8c9388]">
          Você será redirecionado para editar seu perfil
        </p>

        <span
          className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full border-[10px] border-[#dfeedd]"
          aria-hidden="true"
        />
      </section>
    </div>
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
