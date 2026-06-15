"use client";

import { useState } from "react";
import { updateProfile } from "@/app/services/api/profile.api";

interface ProfileCompletionModalProps {
  missingFields: string[];
  userId: string | null;
  userRole: "student" | "teacher";
  onContinue: () => void;
}

export function ProfileCompletionModal({
  missingFields,
  userId,
  userRole,
  onContinue,
}: ProfileCompletionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    campus_location: "",
    department: "",
  });
  const [error, setError] = useState<string | null>(null);

  const fieldLabels: Record<string, string> = {
    description: "Descrição de perfil",
    campus_location: "Localização do campus",
    department: "Departamento",
    profile_photo_url: "Foto de perfil",
    cover_photo_url: "Foto de capa",
  };

  const requiredFields = missingFields.filter((f) =>
    ["description", "campus_location", "department"].includes(f)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!userId) {
        throw new Error("ID do usuário não encontrado");
      }

      // Validate all required fields are filled
      for (const field of requiredFields) {
        const value = formData[field as keyof typeof formData];
        if (!value || !value.trim()) {
          throw new Error(`${fieldLabels[field]} é obrigatório`);
        }
      }

      // Prepare update payload
      const updatePayload: Record<string, string> = {};
      if (missingFields.includes("description")) {
        updatePayload.description = formData.description;
      }
      if (missingFields.includes("campus_location")) {
        updatePayload.campus_location = formData.campus_location;
      }
      if (missingFields.includes("department")) {
        updatePayload.department = formData.department;
      }

      // Call update API
      await updateProfile(userId, updatePayload);

      // Success
      onContinue();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/60 px-4 py-8 backdrop-blur-sm overflow-y-auto">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-modal-title"
        className="relative w-full max-w-lg rounded-2xl bg-white px-8 pb-10 pt-10 text-center shadow-soft-xl my-8 border border-pastel-support/20"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-light shadow-soft">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-dark">
            <LeafIcon className="h-6 w-6 text-white" />
          </span>
        </div>

        <h2
          id="completion-modal-title"
          className="mx-auto mt-6 max-w-xs text-2xl font-bold leading-tight tracking-tight text-primary-dark"
        >
          Complete Seu Perfil
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-sm font-normal leading-relaxed text-neutral-muted">
          Para usar a plataforma, preencha os campos obrigatórios abaixo.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 text-left space-y-5">
          {missingFields.includes("description") && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
                {fieldLabels.description}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Conte um pouco sobre você..."
                className="w-full rounded-xl border border-pastel-support bg-white px-4 py-3 text-sm font-normal text-neutral-darker placeholder-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-all"
                rows={3}
              />
            </div>
          )}

          {missingFields.includes("campus_location") && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
                {fieldLabels.campus_location}
              </label>
              <input
                type="text"
                value={formData.campus_location}
                onChange={(e) =>
                  setFormData({ ...formData, campus_location: e.target.value })
                }
                placeholder="Ex: Campus Recife"
                className="w-full rounded-xl border border-pastel-support bg-white px-4 py-3 text-sm font-normal text-neutral-darker placeholder-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-all"
              />
            </div>
          )}

          {missingFields.includes("department") && userRole === "teacher" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-2">
                {fieldLabels.department}
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Ex: Agronomia"
                className="w-full rounded-xl border border-pastel-support bg-white px-4 py-3 text-sm font-normal text-neutral-darker placeholder-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-all"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-danger-light px-4 py-3 text-xs font-semibold text-danger-primary border border-danger-primary/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 h-12 w-full rounded-xl bg-primary-dark text-sm font-bold text-white shadow-soft transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Continuar"}
          </button>
        </form>

        <span
          className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full border-[10px] border-pastel-support/20"
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
